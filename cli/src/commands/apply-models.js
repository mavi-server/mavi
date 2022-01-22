const path = require('path')
const { readFile, writeFile, readdir } = require('fs')

// Functionalities
const { generateSchemaSQL, createTables } = require('../utils/schema')

// Env variables
require('dotenv').config({ path: path.resolve('.env') })

// Database connection
const config = require(path.join(process.cwd(), './index'))
const knex = require(path.join(__dirname, '../../../database'))(config.database)
const modelsTable = 'blueserver_models'
const modelsPath = path.join(process.cwd(), './models')
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

// get all models
const models = require(modelsPath + '/index.js')
up(models)
// down(models)

// process.exit(1)

// assign trace ids to each models and columns if not exists
// ...
// ...

// check modelsTable and insert/update models
// knex.schema.hasTable(modelsTable).then((exists) => {
//   if (!exists) {
//     knex.schema.createTable(modelsTable, (table) => {
//       table.string('model_name', 128).primary()
//       table.string('model_schema', 1024)
//     })
//   }

//   // knex.
// })

// // test results
// const test_result = await knex.select('*').from(modelsTable)
// console.log(test_result)

// 0. fetch all models from database
// 0.1 if not exists, write models into database
// 1. check for trace ids from models object which user defined
// 1.1 give trace ids if not exists
// 1.2 overwrite trace ids into original model files
// 2. compare trace ids from database with trace ids from models object
// 2.1 detect the changings
// 2.2 apply the changes with knex query builder
// 2.3 if the is changins, increase the version number of the model
// 3 write changes into database

// Register models
//knex

// knex.select("*").from("posts").limit(10).then(res => {
//   console.log(res)
//   process.exit(1)
// })
