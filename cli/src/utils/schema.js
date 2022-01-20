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

/**
 * 
 * @param {object} models 
 * @param {object} options
 * @returns 
 */

const generateSchemaSQL = (models, options = {}) => {
  const SQL = {}
  for (const model in models) {
    const Table = models[model] // alias
    let tableSchemaString = []

    for (const column in Table) {
      const settings = Table[column]
      let columnSchemaString = ''

      // timestamps
      if (column === 'timestamps' && Array.isArray(settings)) {
        columnSchemaString = columnSchemaString.concat(`table.timestamps(${settings[0]},${settings[1]})`)
        tableSchemaString.push(columnSchemaString)

        continue
      }

      // type
      if (settings.type) {
        columnSchemaString = columnSchemaString.concat(`table.${settings.type}`)
      } else throw new Error('generate-tables.js: type is required')


      // column, maxlength, dataset
      if (settings.maxlength) { // set max length if exists
        columnSchemaString = columnSchemaString.concat(`('${column}', ${settings.maxlength})`)
      } else if (settings.dataset) { // enum dataset
        columnSchemaString = columnSchemaString.concat(`('${column}', ${JSON.stringify(settings.dataset)})`)
      } else { // set column without max length
        columnSchemaString = columnSchemaString.concat(`('${column}')`)
      }

      // constraints
      if (settings.constraints && Array.isArray(settings.constraints)) {
        settings.constraints.forEach(fn => {
          columnSchemaString = columnSchemaString.concat('.', `${fn}()`)
        })
      }

      // default column value
      if (settings.defaultTo) {
        if (settings.type === 'timestamp') {
          settings.defaultTo = 'knex.fn.now()'
        }

        columnSchemaString = columnSchemaString.concat('.', `defaultTo(${settings.defaultTo})`)
      }


      // create column
      tableSchemaString.push(column)

      // foreign key setter
      if (settings.references && settings.inTable) {
        tableSchemaString.push(`table.foreign('${column}').references('${settings.references}').inTable('${settings.inTable}')`)
      } else if (settings.references && !settings.inTable) {
        try {
          const [inTable, references] = settings.references.split('.')
          tableSchemaString.push(`table.foreign('${column}').references('${references}').inTable('${inTable}')`)
        } catch (err) {
          throw err
        }
      }
    }

    // set as function
    SQL[model] = `(table) => {${tableSchemaString.join(';')}}`
  }

  if (options.debug === true) {
    console.log(SQL)
  }

  return SQL
}

const createTables = (Tables) => {
  const eachTableName = Object.keys(Tables)
  const execString = eachTableName.reduce((string, key) => {
    return string.concat(`.createTable("${key}", ${Tables[key]})`)
  }, 'knex.schema')

  try {
    return eval(execString)
  } catch (err) {
    console.error(err.detail)
  }
}
module.exports = { generateModelSql, createTables }