/*
## Description
- generate the tables from model files
- creates a very long sql query and executes it
- used with cli
- these are the commands can be used for generate/delete/seed and migration purposes
  some are the original knex commands and some are modified:
  // package.json
  "scripts": {
    "db:up": "knex migrate:up --knexfile server/database/config.js",
    "db:down": "knex migrate:down --knexfile server/database/config.js",
    "db:make": "knex migrate:make db --knexfile server/database/config.js",
    "db:latest": "knex migrate:latest --knexfile server/database/config.js",
    "db:rollback": "knex migrate:rollback --knexfile server/database/config.js",
    "db:list": "knex migrate:list --knexfile server/database/config.js",
    "db:seed": "knex seed:run --knexfile server/database/config.js",
    "db:res": "npm run db:down && npm run db:up && npm run db:seed",
  }
*/

const models = require('../models')
const Tables = {}
Object.keys(models).forEach(tableName => {
  // alias
  const Table = models[tableName]
  let tableSchemaString = []

  Object.keys(Table).map(column => {
    // alias
    const columnName = column
    const settings = Table[columnName]
    column = ''

    // special setter for timestamps setting
    if (columnName === 'timestamps' && Array.isArray(settings)) {
      column = column.concat(`table.timestamps(${settings[0]},${settings[1]})`)
      tableSchemaString.push(column)

      return true
    }

    if (settings.type) {
      column = column.concat(`table.${settings.type}`)
    } else throw new Error('generate-tables.js: type is required')


    // column, maxlength, datasets
    if (settings.maxlength) { // set max length if exists
      column = column.concat(`('${columnName}', ${settings.maxlength})`)
    } else if (settings.dataset) { // enum dataset
      column = column.concat(`('${columnName}', ${JSON.stringify(settings.dataset)})`)
    } else { // set column without max length
      column = column.concat(`('${columnName}')`)
    }

    // add constraints
    if (settings.constraints && Array.isArray(settings.constraints)) {
      settings.constraints.forEach(fn => {
        column = column.concat('.', `${fn}()`)
      })
    }

    // default value setter
    if (settings.defaultTo) {
      if (settings.type === 'timestamp') {
        settings.defaultTo = 'knex.fn.now()'
      }

      column = column.concat('.', `defaultTo(${settings.defaultTo})`)
    }


    // create column
    tableSchemaString.push(column)

    // foreign key setter
    if (settings.references && settings.inTable) {
      tableSchemaString.push(`table.foreign('${columnName}').references('${settings.references}').inTable('${settings.inTable}')`)
    } else if (settings.references && !settings.inTable) {
      try {
        const [inTable, references] = settings.references.split('.')
        tableSchemaString.push(`table.foreign('${columnName}').references('${references}').inTable('${inTable}')`)
      } catch (err) {
        throw err
      }
    }

    return true
  })

  // set as function
  Tables[tableName] = `(table) => {${tableSchemaString.join(';')}}`
})

// console.log(Tables)
module.exports = Tables