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
  console.log(`Executing schema queries...`)
  console.log(`${Object.keys(SchemaSQL).length} tables to create`)

  // execute queries
  for (const model in SchemaSQL) {
    const sql = SchemaSQL[model]
    await knex.schema.createTable(model, (table) => {
      eval(sql)
      console.log(`\x1b[32m[Table ${model} created]\x1b[0m`)
      return table
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
      table.increments('id').primary()
      table.string('model_name', 128).unique()
      table.json('model_json')
    })
  }

  // get all models
  knex.select('*').from(modelsTable).then(async (rows) => {
    for (const model in models) {
      for (const column in models[model]) {
        // assign hash to each columns if not exists
        if (!models[model][column].hash) {
          models[model][column].hash = Buffer.from(`${model}.${column}`).toString('base64url')

          // results should overwrite the model files
        }
      }

      // create model if not exists
      if (!rows.find(row => row.model_name === model)) {
        await knex(modelsTable).insert({ model_name: model, model_json: JSON.stringify(models[model]) })
      }

      // update models
      else await knex(modelsTable).where({ 'model_name': model }).update({ model_name: model, model_json: JSON.stringify(models[model]) })
    }
  })
})
// console.log(models)

// up(models)
// down(models)


// // test results
// const test_result = await knex.select('*').from(modelsTable)
// console.log(test_result)
