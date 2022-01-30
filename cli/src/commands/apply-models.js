// this file needs testing for edge cases

const path = require('path')
const util = require("util")
const { writeFile, existsSync, readdirSync } = require('fs')
const debug = false

// Functionalities
const { generateSchemaSQL, generateColumnType, generateForeignKey } = require('../utils/schema')

// Env variables
require('dotenv').config({ path: path.resolve('.env') })

// -
const modelsTable = 'DATABASE_STATE'
const configPath = path.join(process.cwd(), './index.js')
const modelsPath = path.join(process.cwd(), './models/')
const modelsDirExists = existsSync(modelsPath)

// -
const $config = require('../../../config')
const config = require(configPath)
const models = modelsDirExists ? require(path.join(modelsPath, './index.js')) : config.api.define.models  // get all models

// Database connection
const knex = require(path.join(__dirname, '../../../database'))(config.database)

// Create trigger-functions
const createTriggers = async () => {
  for (const fn in $config.database.triggerFunctions) {
    knex.raw($config.database.triggerFunctions[fn]).then(() => {
      console.log(`\x1b[32m[Function ${fn} created]\x1b[0m`)
    })
  }
}
const assignHashesAndWrite = async (model) => {
  let newHashAssigned = false
  if (!models[model].hash) { // assign new model hash
    models[model].hash = Buffer.from(`[${Date.now()}]${model}`).toString('base64url')
    console.log(`\x1b[35m[Assigned new hash: ${model}]\x1b[0m`)
    newHashAssigned = true
  }
  for (const column in models[model]) {
    if (column === "hash") continue
    if (!models[model][column].hash) { // assign new column hash
      models[model][column].hash = Buffer.from(`[${Date.now()}]${model}.${column}`).toString('base64url')
      console.log(`\x1b[35m[Assigned new hash: ${model}.${column}]\x1b[0m`)
      newHashAssigned = true
    }
  }

  if (newHashAssigned) {
    // overwrite new assigned hashes
    if (modelsDirExists) { // to model files
      writeFile(`${modelsPath}/${model}.js`, `module.exports = ${util.inspect(models[model], false, 2)}`, (err) => {
        if (err) throw err
        console.log(`\x1b[32m[${model}.js updated]\x1b[0m`)
      })
    }
    // else { // to index.js (not working yet)
    //   config.api.define.models[model] = models[model]
    //   let configFile = readFileSync(configPath, 'utf-8')
    //   const searchRegexp = RegExp(`${model}[ :](\{.*\:.*\})`, 'gm')
    //   const modelJSON = util.inspect(models[model], false, 2)
    //   configFile = configFile.replace(searchRegexp, `${model} : ${modelJSON}`)

    //   // // to config file
    //   writeFile(`${configPath}`, util.inspect(configFile, false, 1), (err) => {
    //     if (err) throw err
    //     console.log(`\x1b[32m[config.api.define.models.${model} updated]\x1b[0m`)
    //   })
    // }
  }
}
const onUpdateTrigger = table => `
  CREATE TRIGGER ${table}_updated_at
  BEFORE UPDATE ON ${table} FOR EACH ROW
  EXECUTE PROCEDURE on_update_timestamp();
`
const seedModelIfSeedableAndNotSeeded = async (model, seeded) => {
  // check seed data
  if (!seeded) {
    const seedFile = `${model}.seed.js`
    const modelSeedExists = existsSync(path.join(modelsPath, seedFile))
    let modelSeed = {}

    if (modelSeedExists) modelSeed = require(path.join(modelsPath, seedFile))
    else if (model in config.api.define.seeds) modelSeed = config.api.define.seeds[model]

    await knex(model).insert(modelSeed).then(() => {
      seeded = true
      console.log(`\x1b[32m[${model} seeded]\x1b[0m`)
    })
  }

  return seeded
}

// check database state and apply models
knex.schema.hasTable(modelsTable).then(async (exists) => {
  if (!exists) {
    // create new database state for detecting model file changes
    await knex.schema.createTable(modelsTable, (table) => {
      table.string('model_hash', 128).primary()
      table.string('model_name', 128).unique()
      table.boolean('model_seeded').defaultTo(false)
      table.json('model_json')
    })
  }

  // select all models
  knex.select('*').from(modelsTable).then(async (db_models) => {
    // ### compare database state with models ###
    for (const row of db_models) {

      // find model in models
      const model_exists = Object.keys(models).find(m => models[m].hash === row.model_hash)

      // model exists in models
      if (model_exists) for (const column in row.model_json) {
        if (column === "hash") continue

        const column_exists = Object.keys(models[model_exists]).find(c => row.model_json[column].hash === models[model_exists][c].hash)

        // column not exists in database state
        if (!column_exists) {
          // delete model column from database state
          delete row.model_json[column]

          // update database state
          await knex(modelsTable).where({
            'model_hash': row.model_hash,
          }).update({
            'model_name': row.model_name,
            'model_json': JSON.stringify(row.model_json)
          })

          // delete model table column
          await knex.raw(`ALTER TABLE "${row.model_name}" DROP COLUMN IF EXISTS "${column}" CASCADE`)

          // log
          console.log(`\x1b[31m[${row.model_name}.${column} removed]\x1b[0m`)

          // if there is duplicated column in model file, previous column will be deleted
        }
      }
      else {
        // model removed from models folder
        // *maybe we should give a confirmation before removing the tables

        // delete model from database state
        await knex(modelsTable).where('model_hash', row.model_hash).delete()

        // delete model table
        await knex.raw(`DROP TABLE IF EXISTS "${row.model_name}" CASCADE`)

        // log
        console.log(`\x1b[31m[Table ${row.model_name} removed]\x1b[0m`)
      }
    }
    // ### end compare database state with models ###

    // ### compare models with database state ###
    for (const model in models) {
      // assigne hashes to model properties if not exists
      await assignHashesAndWrite(model)

      // database state > model
      const db_model = db_models.find(m => m.model_hash === models[model].hash)

      // model exists in database state
      if (db_model) {
        // look for the table changes:

        // look for the table rename
        if (db_model.model_name !== model) {
          await knex.schema.renameTable(db_model.model_name, model)
          console.log(`\x1b[36m[Table ${db_model.model_name} renamed to \x1b[34m${model}]\x1b[0m`)

          // important note: if table is renamed, user should update model export names and filenames too
        }

        // look for the column changes
        for (const column in models[model]) {
          if (column === "hash") continue // skip model hash

          const modelWithOneColumn = {
            [model]: {
              [column]: models[model][column]
            }
          }

          let db_model_json_column = {}
          const doesColumnHashMatches = (hash) => {
            const db_columnNames = Object.keys(db_model.model_json).filter(c => c !== 'hash')

            return db_columnNames.find(c => {
              if (db_model.model_json[c].hash === hash) {
                db_model_json_column = db_model.model_json[c]
                db_model_json_column.name = c
                return true
              }
            })
          }

          // find matching column
          if (doesColumnHashMatches(models[model][column].hash)) {
            await knex.schema.alterTable(model, async (table) => {
              // if column renamed
              if (!(column in db_model.model_json)) {
                table.renameColumn(db_model_json_column.name, column)
                console.log(`\x1b[36m[${model}.${db_model_json_column.name} renamed to ${model}.\x1b[32m${column}]\x1b[0m`)
              }

              // if constraints changed
              if (models[model][column].constraints !== db_model_json_column.constraints) {
                if (models[model][column].constraints && !db_model_json_column.constraints) {
                  // constraints defined in model but not in database state
                  // will be handled below
                  console.log(`\x1b[36m[${model}.${column} new constraints defined: \x1b[32m${models[model][column].constraints.join(', ')}]\x1b[0m`)
                }
                else if (!models[model][column].constraints && db_model_json_column.constraints) {
                  // constraints removed from model but exists in database state
                  // will be handled below
                  console.log(`\x1b[36m[${model}.${column} all constraints deleted: \x1b[31m${db_model_json_column.constraints.join(', ')}]\x1b[0m`)
                }
                else {
                  // detect if constraints changed (add/remove)
                  const addedConstraints = models[model][column].constraints.filter(ct => !db_model_json_column.constraints.find(db_ct => db_ct === ct))
                  const removedConstraints = db_model_json_column.constraints.filter(db_ct => !models[model][column].constraints.find(ct => ct === db_ct))

                  if (removedConstraints.length) {
                    removedConstraints.forEach(fn => {
                      let Fn = `drop${fn[0].toUpperCase() + fn.slice(1)}`

                      if (fn === 'nullable') {
                        Fn = 'dropNullable'
                        table[Fn](column)
                      }
                      else if (fn === 'notNullable') {
                        Fn = 'setNullable'
                        table[Fn](column)
                      }
                      else {
                        switch (fn) {
                          case 'unique':
                            constraint = 'unique'
                            break
                          case 'primary':
                            constraint = 'pkey'
                            break
                          case 'foreign':
                            constraint = 'foreign'
                            break
                        }

                        table[Fn](column, `${model}_${column}_${constraint}`)
                      }
                    })

                    console.log(`\x1b[36m[${model} constraints removed: \x1b[32m${removedConstraints.join(', ')}]\x1b[0m`)
                  }
                  if (addedConstraints.length) {
                    // will be handled below
                    console.log(`\x1b[36m[${model} constraints added: \x1b[32m${addedConstraints.join(', ')}]\x1b[0m`)
                  }

                  if ((addedConstraints.length && removedConstraints.length) === 0 && models[model][column].constraints.find(ct => ct === 'primary' || ct === 'unique')) {
                    // GIVES ERROR SO SKIPPING
                    return
                  }
                }
              }

              // if references is changed
              if (models[model][column].references !== db_model_json_column.references) {
                if (db_model_json_column.references) {
                  // remove foreign key
                  const CONSTRAINT_NAME = `${model}_${db_model_json_column.name}__${db_model_json_column.references.replace('.', '_')}_foreign`
                  await knex.raw(`ALTER TABLE ${model} DROP CONSTRAINT IF EXISTS ${CONSTRAINT_NAME}`)
                  console.log(`\x1b[31m[${db_model_json_column.references} foreign key \x1b[0m constraint removed from ${model}.${column}]`)
                }

                if (models[model][column].references) {
                  // add foreign key
                  await eval(generateForeignKey(models[model][column], column, model))
                  console.log(`\x1b[36m[${models[model][column].references} foreign key \x1b[0m constraint added to ${model}.${column}]`)
                }
              }

              // if enum dataset is changed (must check this one specially)
              if (models[model][column].type === "enum") {
                const addedEnums = models[model][column].dataset.filter(e => !db_model_json_column.dataset.find(db_e => db_e === e))
                const removedEnums = db_model_json_column.dataset.filter(db_e => !models[model][column].dataset.find(e => e === db_e))


                // if enums changed
                if (removedEnums.length || addedEnums.length) {
                  const dataset = models[model][column].dataset.map(d => `'${d}'::text`).join(', ')

                  // needs to drop check-constraint first
                  await knex.raw(`
                    ALTER TABLE "${model}" DROP CONSTRAINT IF EXISTS "${model}_${column}_check";
                    ALTER TABLE "${model}" ADD CONSTRAINT "${model}_${column}_check" CHECK (${column} IN (${dataset}));
                  `)
                  // then add new check-constraint without altering the column
                  // important note here: if some rows in the database have values that are not in the new dataset, query will fail

                  console.log(`\x1b[36m[${model}.${column} dataset changed: ${db_model_json_column.dataset.join(', ')} -> \x1b[32m${models[model][column].dataset.join(', ')} \x1b[0m`)
                }
                return
              }

              let columnSchemaString = generateColumnType(models[model][column], column) + '.alter()'
              await eval(columnSchemaString)
              // console.log({ [model + '.' + column]: columnSchemaString })

              // ### Logs ###
              // if column type changed
              if (db_model_json_column.type !== models[model][column].type) {
                console.log(`\x1b[36m[${model}.${column}.type changed from ${db_model_json_column.type} to \x1b[32m${models[model][column].type}]\x1b[0m`)
              }
              // if column length changed
              if (db_model_json_column.maxlength !== models[model][column].maxlength) {
                console.log(`\x1b[36m[${model}.${column}.maxlength changed from ${db_model_json_column.maxlength} to \x1b[32m${models[model][column].maxlength}]\x1b[0m`)
              }
              // if charset, defaultTo, comment, or unsigned is changed, just log it
              ["charset", "defaultTo", "comment", "unsigned"].forEach(fn => {
                if (db_model_json_column[fn] !== models[model][column][fn]) {
                  console.log(`\x1b[36m[${model}.${column}.${fn} changed from ${db_model_json_column[fn]} to \x1b[32m${models[model][column][fn]}]\x1b[0m`)
                }
                else if (!models[model][column][fn] && db_model_json_column[fn]) {
                  console.log(`\x1b[36m[${model}.${column}.${fn} removed]\x1b[0m`)
                }
                else if (models[model][column][fn] && !db_model_json_column[fn]) {
                  console.log(`\x1b[36m[${model}.${column}.${fn} added]\x1b[0m`)
                }
              })
            })
          }

          // not matched. create a new column
          else {
            await knex.schema.alterTable(model, async (table) => {
              eval(generateSchemaSQL(modelWithOneColumn, { debug })[model])
              console.log(`\x1b[32m[${model}.${column} created]\x1b[0m`)
            })
          }
        }

        db_model.model_seeded = await seedModelIfSeedableAndNotSeeded(model, db_model.model_seeded)


        // update database state for model
        await knex(modelsTable).where({
          'model_hash': models[model].hash
        }).update({
          'model_name': model,
          'model_seeded': db_model.model_seeded,
          'model_json': JSON.stringify(models[model])
        })
      }

      // create new database state for the model
      else {
        await knex.raw(`DROP TABLE IF EXISTS "${model}" CASCADE`)
        await knex.schema.createTable(model, (table) => {
          eval(generateSchemaSQL({ [model]: models[model] }, { debug })[model])
          console.log(`\x1b[32m[Table ${model} created]\x1b[0m`)
        }).then(async () => await knex.raw(onUpdateTrigger(model)))

        const seeded = await seedModelIfSeedableAndNotSeeded(model, false)

        const data = {
          'model_hash': models[model].hash,
          'model_name': model,
          'model_seeded': seeded,
          'model_json': JSON.stringify(models[model])
        }
        await knex(modelsTable).insert(data)
      }
    }
    // ### end compare models with database state ###
  })
})

// // see database state:
// const test_result = await knex.select('*').from(modelsTable)
// console.log(test_result)

// note:
// if any error occurs, the database state will be broken
// maybe rollback/commit can be used to fix the database state