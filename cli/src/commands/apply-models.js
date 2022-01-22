const path = require('path')
const util = require("util")
const { readFile, writeFile, readdir } = require('fs')
const debug = true

// Functionalities
const { generateSchemaSQL } = require('../utils/schema')

// Env variables
require('dotenv').config({ path: path.resolve('.env') })

// Database connection
const config = require(path.join(process.cwd(), './index'))
const knex = require(path.join(__dirname, '../../../database'))(config.database)
const modelsTable = 'DATABASE_STATE'
const modelsPath = path.join(process.cwd(), './models')
const models = require(modelsPath + '/index.js') || {} // get all models
const assignHashesAndWrite = async (model) => {
  let newHashAssigned = false
  if (!models[model].hash) { // assign new model hash
    models[model].hash = Buffer.from(`${model}`).toString('base64url')
    newHashAssigned = true
  }
  for (const column in models[model]) {
    if (column === "hash") continue
    if (!models[model][column].hash) { // assign new column hash
      models[model][column].hash = Buffer.from(`${model}.${column}`).toString('base64url')
      newHashAssigned = true
    }
  }

  if (newHashAssigned) {
    // write new assigned hashes in model files
    writeFile(`${modelsPath}/${model}.js`, `module.exports = ${util.inspect(models[model], false, 2)}`, (err) => {
      if (err) throw err
      console.log(`\x1b[32m[${model}.js updated]\x1b[0m`)
    })
  }
}

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

  // get all models
  knex.select('*').from(modelsTable).then(async (db_models) => {
    // ## update db state ##

    // console.log(db_models)
    // ## compare database state with models ##
    for (const row of db_models) {
      // drop table
      if (!(row.model_name in models)) {
        // model removed from models folder
        // *we should give a confirmation before removing the tables

        // delete model from db state
        await knex(modelsTable).where('model_name', row.model_name).delete()

        // delete model table
        await knex.raw(`DROP TABLE IF EXISTS "${row.model_name}" CASCADE`)
        console.log(`\x1b[31m[Table ${row.model_name} removed]\x1b[0m`)
      }

      // check table columns
      else if (row.model_hash === models[row.model_name].hash) {
        for (const column in row.model_json) {
          if (column === "hash") continue

          // // find column matches
          // if (row.model_json[column].hash === models[row.model_name][column].hash) {
          //   console.log(`${row.model_name}.${column}`, column in models[row.model_name])
          // }

          // console.log(`${row.model_name}.${column}`, column in models[row.model_name])

          // drop column if not exists on db state
          if (!(column in models[row.model_name])) {
            await knex.raw(`ALTER TABLE "${row.model_name}" DROP COLUMN IF EXISTS "${column}" CASCADE`)
            console.log(`\x1b[31m[Column ${column} removed from ${row.model_name}]\x1b[0m`)
          }
        }
      }
    }

    // ## compare models with database state ##
    for (const model in models) {
      // assigne hashes to model properties if not exists
      await assignHashesAndWrite(model)

      const db_model = db_models.find(m => m.model_name === model)

      // model exists in database state
      if (db_model) {
        // look for the table changes
        if (models[model].hash === db_model.model_hash) { // find existing model
          // look for the table rename
          if (db_model.model_name !== model) {
            await knex.schema.renameTable(db_model.model_name, model)
            console.log(`[Table ${db_model.model_name} renamed to \x1b[34m${model}\x1b[0m]`)
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
                console.log(`[${model}.${db_model_json_column.name} renamed to ${model}.\x1b[34m${column}\x1b[0m]`)
              }
            }

            // regenerate the all column properties
            // await knex.schema.alterTable(model, (table) => {
            //   // del column
            //   table.dropColumn(column)
            //   // need improvment!!
            //   // add column
            //   eval(generateSchemaSQL(modelWithOneColumn, { debug })[model])
            // })
            // console.log(`[${model}.${column} properties are regenerated\x1b[0m]`)

            // // not matched. create a new column
            else {
              await knex.schema.alterTable(model, async (table) => {
                eval(generateSchemaSQL(modelWithOneColumn, { debug })[model])
                console.log(`\x1b[32m[Column ${model}.${column} created]\x1b[0m`)
              })
            }
          }
        }

        // create new table from model
        else {
          await knex.schema.createTable(model, (table) => {
            eval(generateSchemaSQL({ [model]: models[model] }, { debug })[model])
            console.log(`\x1b[32m[Table ${model} created]\x1b[0m`)
          })
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
        const data = {
          'model_hash': models[model].hash,
          'model_name': model,
          'model_json': JSON.stringify(models[model])
        }
        await knex(modelsTable).insert(data)

        // create new table for the model
        await knex.schema.createTable(model, (table) => {
          eval(generateSchemaSQL({ [model]: models[model] }, { debug })[model])
          console.log(`\x1b[32m[Table ${model} created]\x1b[0m`)
        })
      }
    }
    // ## end update db state ##
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