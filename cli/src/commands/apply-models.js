const path = require('path')
const { readFile, writeFile, readdir } = require('fs')

// Functionalities
const { generateSchemaSQL, createTables } = require('../utils/schema')


// Env variables
require('dotenv').config({ path: path.resolve('.env') })

// Database connection
const config = require(path.join(process.cwd(), './index'))
const queryBuilder = require(path.join(__dirname, '../../../database'))(config.database)
const modelsPath = path.join(process.cwd(), './models')

readdir(modelsPath, (err, files) => {
  if (err) {
    console.log(err)
    process.exit(1)
  }

  const models = files.filter(file => file.endsWith('.js') && file != 'index.js')
  const modelsBundle = {}
  for (const model of models) {
    const [modelName] = model.split('.')
    modelsBundle[modelName] = require(path.join(modelsPath, model))
  }
  const SQL = generateSchemaSQL(modelsBundle, { debug: true })


  // createTables(SQL)
})


// Register models
//queryBuilder


// queryBuilder.select("*").from("posts").limit(10).then(res => {
//   console.log(res)
//   process.exit(1)
// })

