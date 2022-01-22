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
      let columnSchemaString = ''
      const settings = Table[column]

      // ## set chainable properties ## 

      // type is required
      if (!settings.type) {
        throw Error('schema generator: type is required')
      }

      if ("type" in settings) {
        // ## set type specific properties ##
        columnSchemaString = columnSchemaString.concat(`table.${settings.type}`)

        if (["integer", "bigInteger", "tinyint", "string", "binary", "increments"].includes(settings.type)) {
          // set with length
          if ("maxlength" in settings) {
            // set max length if exists
            columnSchemaString = columnSchemaString.concat(`('${column}', ${settings.maxlength})`)
          }
          else columnSchemaString = columnSchemaString.concat(`('${column}')`)
        }

        // set dataset if exists
        else if ("dataset" in settings) {
          // enum dataset
          columnSchemaString = columnSchemaString.concat(`('${column}', ${JSON.stringify(settings.dataset)})`)
        }

        // default value for timestamp and datetime is current time
        else if (settings.type.match(/datetime|timestamp/)) {
          if ("useTz" in settings) columnSchemaString = columnSchemaString.concat(`('${column}', { useTz: ${settings.useTz} })`)
          else if ("useTz" && "precision" in settings) columnSchemaString = columnSchemaString.concat(`('${column}', { useTz: ${settings.useTz}, precision: ${settings.precision} })`)
          else columnSchemaString = columnSchemaString.concat(`('${column}')`)

          // set default columns for special columns
          // ERRORRR!!!
          // if (column.match(/update/)) {
          //   settings.defaultTo = "knex.raw('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')"
          // }
          // else if (column.match(/create/)) {
          //   settings.defaultTo = "knex.raw('CURRENT_TIMESTAMP')"
          // }
        }
        else if (settings.type.match(/time/)) {
          if ("precision" in settings) columnSchemaString = columnSchemaString.concat(`('${column}', { precision: ${settings.precision} })`)
        }
        else columnSchemaString = columnSchemaString.concat(`('${column}')`)
        // ## end type specific properties ##
      }
      if ("constraints" in settings) {
        if (!Array.isArray(settings.constraints)) {
          throw Error('schema generator: constraints must be an array')
        }

        // set constraints
        settings.constraints.forEach(fn => {
          // 'primary' | 'nullable' | 'notNullable' | 'unique' | 'unsigned'
          columnSchemaString = columnSchemaString.concat(`.${fn}()`)
        })
      }
      if ("defaultTo" in settings) {
        columnSchemaString = columnSchemaString.concat(`.defaultTo("${settings.defaultTo}")`)
      }
      if ("charset" in settings) {
        columnSchemaString = columnSchemaString.concat(`.charset('${settings.charset}')`)
      }
      if ("comment" in settings) {
        columnSchemaString = columnSchemaString.concat(`.comment('${settings.comment}')`)
      }

      // create column
      tableSchemaString.push(columnSchemaString)
      // ## end chainable properties ## 


      // ## set foreign keys at the end
      if ("references" in settings) {
        if (settings.references.split('.').length === 0) {
          throw Error('schema generator: `references` must be in format table.column')
        }

        // set foreign key
        columnSchemaString = `table.foreign('${column}')`
        columnSchemaString = columnSchemaString.concat(`.references('${settings.references}')`)

        // set foreign key events
        const events = ['onDelete', 'onUpdate']
        events.forEach(fn => {
          // 'RESTRICT' | 'CASCADE' | 'SET NULL' | 'NO ACTION'
          if (fn in settings) {
            settings[fn] = settings[fn].toUpperCase()
            columnSchemaString = columnSchemaString.concat(`.${fn}('${settings[fn]}')`)
          }
        })

        // create foreign key
        tableSchemaString.push(columnSchemaString)
      }
      // ## end foreign keys ##
    }

    // set as function 
    // used as: knex.schema.createTable(tableName, (table) => {...tableSchemaString...})
    SQL[model] = tableSchemaString.join(';')
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

module.exports = { generateSchemaSQL, createTables }