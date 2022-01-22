const path = require('path')
const { readFile, writeFile, readdir } = require('fs')

// Functionalities
const { generateSchemaSQL, createTables } = require('../utils/schema')

// Env variables
require('dotenv').config({ path: path.resolve('.env') })

// Database connection
const config = require(path.join(process.cwd(), './index'))
const knex = require(path.join(__dirname, '../../../database'))(config.database)
const modelsTable = 'DATABASE_STATE'
const modelsPath = path.join(process.cwd(), './models')
const models = require(modelsPath + '/index.js') // get all models
const up = async (models) => {
  // Generate schema queries for restructuring the database
  const SchemaSQL = generateSchemaSQL(models, { debug: false })
  const tableCount = Object.keys(SchemaSQL).length
  console.log(`Executing schema queries...`)
  console.log(`${tableCount} table${tableCount ? 's' : ''} to create`)

  // execute queries
  for (const model in SchemaSQL) {
    const sql = SchemaSQL[model]
    await knex.schema.createTable(model, (table) => {
      eval(sql)
      console.log(`\x1b[32m[Table ${model} created]\x1b[0m`)
    })
  }
}
const down = async (models) => {
  for (const model in models) {
    try {
      await knex.raw(`DROP TABLE IF EXISTS "${model}" CASCADE`)
      console.log(`\x1b[31m[Table ${model} removed]\x1b[0m`)
    } catch (err) {
      console.error(err.detail)
    }
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
    for (const db_model in db_models) {
      if (!db_model in models) {
        // delete database model
        await knex(modelsTable).where('model_name', db_model).delete()

        // delete database table
        down({ [db_model]: 'i will be destroyed' })
      }
    }
    // ## end update db state ##

    for (const model in models) {
      // ## hash assigning ##
      if (!models[model].hash) { // assign new model hash
        models[model].hash = Buffer.from(`${model}`).toString('base64url')

        for (const column in models[model]) {
          if (!models[model][column].hash) { // assign new column hash
            models[model][column].hash = Buffer.from(`${model}.${column}`).toString('base64url')
          }
        }
      }
      /** After this process is completed, we should overwrite to models.js files */
      // ## end hash assigning ##

      // ## compare the models with database state ##
      const db_model = db_models.find(m => m.model_name === model)
      if (db_models) { // model exists in database
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

          for (const column in models[model]) {
            // look for the column changes

            // get db_model_json_column
            let db_model_json_column = {}
            for (c in db_model.model_json) {
              if (db_model.model_json[c].hash === models[model][column].hash) {
                db_model_json_column = db_model.model_json[c]
                db_model_json_column.name = c
              }
            }

            if (models[model][column].hash === db_model_json_column.hash) { // find existing column
              // look for the column rename
              if (!column in db_model.model_json) {
                await knex.schema.alterTable(model, (table) => {
                  table.renameColumn(db_model_json_column.name, column)
                })
                console.log(`[${model}.${db_model_json_column.name} renamed to ${model}.\x1b[34m${column}\x1b[0m]`)
              }

              // look for the column property type changes
              else {
                // type changes
                if (db_model.model_json[column].type !== models[model][column].type) {
                  await knex.schema.alterTable(model, (table) => {
                    table.alterColumn(column, models[model][column].type)
                  })
                  console.log(`[Column ${model}.${column} type changed to ${model}.\x1b[34m${models[model][column].type}\x1b[0m]`)
                }
              }

            }
            else { // create new column
              const modelWithOneColumn = {
                [model]: {
                  [column]: models[model][column]
                }
              }
              await knex.schema.alterTable(model, (table) => {
                eval(generateSchemaSQL(modelWithOneColumn, { debug: false })[model])
                console.log(`\x1b[32m[Column ${model}.${column} created]\x1b[0m`)
              })
            }
          }
        }
        else { // create new model
          await knex.schema.createTable(model, (table) => {
            eval(generateSchemaSQL({ [model]: models[model] }, { debug: false })[model])
            console.log(`\x1b[32m[Table ${model} created]\x1b[0m`)
          })
        }
      }

      // model does not exist in database
      else {
        const data = {
          model_hash: models[model].hash,
          model_name: model,
          model_json: JSON.stringify(models[model])
        }
        // create new database state for the model
        await knex(modelsTable).insert(data)

        // create new table for the model
        up({ [model]: models[model] })
      }
      // ## end comparison ##
    }
  })
})
// console.log(models)

// up(models)
// down(models)


// // test results
// const test_result = await knex.select('*').from(modelsTable)
// console.log(test_result)
