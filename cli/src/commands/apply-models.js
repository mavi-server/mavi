const path = require('path')
const util = require("util")
const { writeFile, existsSync } = require('fs')
const debug = true

// Functionalities
const { generateSchemaSQL } = require('../utils/schema')

// Env variables
require('dotenv').config({ path: path.resolve('.env') })

// -
const modelsTable = 'DATABASE_STATE'
const configPath = path.join(process.cwd(), './index.js')
const modelsPath = path.join(process.cwd(), './models/')
const modelsDirExists = existsSync(modelsPath)

// -
const config = require(configPath)
const models = modelsDirExists ? require(path.join(modelsPath, './index.js')) : config.api.define.models  // get all models

// Database connection
const knex = require(path.join(__dirname, '../../../database'))(config.database)

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

// check modelsTable and insert/update models
knex.schema.hasTable(modelsTable).then(async (exists) => {
  if (!exists) {
    // create modelsTable for detecting model file changes
    await knex.schema.createTable(modelsTable, (table) => {
      table.string('model_hash', 128).primary()
      table.string('model_name', 128).unique()
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
          console.log(`\x1b[31m[Column ${column} removed from ${row.model_name}]\x1b[0m`)

          // if there is duplicated column in model file, previous column will be deleted
        }
      }
      else {
        // model removed from models folder
        // *we should give a confirmation before removing the tables

        // delete model from database state
        await knex(modelsTable).where('model_hash', row.model_hash).delete()

        // delete model table
        await knex.raw(`DROP TABLE IF EXISTS "${row.model_name}" CASCADE`)

        // log
        console.log(`\x1b[31m[Table ${row.model_name} removed]\x1b[0m`)
      }
    }

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

          // if table is renamed, user should update model export names and filenames too
        }
        // look for the other changes, like foreign key changes
        // ...
        // ...
        // ...

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
            // if column renamed
            if (!(column in db_model.model_json)) {
              await knex.schema.alterTable(model, (table) => {
                table.renameColumn(db_model_json_column.name, column)
              })
              console.log(`\x1b[36m[${model}.${db_model_json_column.name} renamed to ${model}.\x1b[32m${column}]\x1b[0m`)
            }

            // column maxlength changed
            // if (db_model_json_column.maxlength !== models[model][column].maxlength) {
            //   await knex.schema.alterTable(model, (table) => {
            //     table.string(column, models[model][column].maxlength)
            //   })
            //   console.log(`[${model}.${column} maxlength changed to \x1b[34m${models[model][column].maxlength}\x1b[0m]`)
            // }
          }

          // regenerate the all column properties
          // await knex.schema.alterTable(model, (table) => {
          //   // del column
          //   table.dropColumn(column)
          //   // need improvment!!
          //   // add column
          //   eval(generateSchemaSQL(modelWithOneColumn, { debug })[model])
          // })
          // console.log(`[${ model }.${ column } properties are regenerated\x1b[0m]`)

          // // not matched. create a new column
          else {
            await knex.schema.alterTable(model, async (table) => {
              eval(generateSchemaSQL(modelWithOneColumn, { debug })[model])
              console.log(`\x1b[32m[Column ${model}.${column} created]\x1b[0m`)
            })
          }
        }

        // update database state for model
        await knex(modelsTable).where({
          'model_hash': models[model].hash
        }).update({
          'model_name': model,
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

        const data = {
          'model_hash': models[model].hash,
          'model_name': model,
          'model_json': JSON.stringify(models[model])
        }
        await knex(modelsTable).insert(data)
      }
    }
    // ### end compare models with database state ###
  })
})
// console.log(models)

// up(models)
// down(models)


// // test results
// const test_result = await knex.select('*').from(modelsTable)
// console.log(test_result)


// note:
// if any error occurs, the database state will be broken