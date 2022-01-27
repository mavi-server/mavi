/**
 * 
 * @param {object} models 
 * @param {object} options
 * @returns 
 */

const generateColumnType = (settings, column) => {
  let columnSchemaString = `table.${settings.type}`

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
  else if (settings.type.match(/datetime|timestamp/g)) {
    if (!("precision" in settings)) settings.precision = 6
    if (!("useTz" in settings)) settings.useTz = true

    columnSchemaString = columnSchemaString.concat(`('${column}', { useTz: ${settings.useTz}, precision: ${settings.precision} })`)

    // set default columns for special columns
    if (column.match(/[Cc]reate|[Uu]pdate/g)) {
      columnSchemaString = columnSchemaString.concat(`.defaultTo(knex.fn.now(${settings.precision}))`)
    }
  }
  else if (settings.type.match(/time/g)) {
    if ("precision" in settings) columnSchemaString = columnSchemaString.concat(`('${column}', { precision: ${settings.precision} })`)
  }
  else columnSchemaString = columnSchemaString.concat(`('${column}')`)

  return columnSchemaString
}

const generateSchemaSQL = (models, options = {}) => {
  const SQL = {}
  for (const model in models) {
    const Table = models[model] // alias
    let tableSchemaString = []

    for (const column in Table) {
      if (column === 'hash') continue

      const settings = Table[column]

      // type is required
      if (!settings.type) {
        throw Error('schema generator: type is required')
      }

      // ########
      let columnSchemaString = generateColumnType(settings, column)
      ["charset", "defaultTo", "comment", "unsigned"]
        .filter(fn => fn in settings)
        .forEach(fn => {
          columnSchemaString = columnSchemaString.concat(`.${fn}()`)
        })
      tableSchemaString.push(columnSchemaString) // create column
      // ########


      // add foreign keys
      if ("references" in settings) {
        if (settings.references.split('.').length === 0) {
          throw Error('schema generator: `references` must be in format table.column')
        }
        if (!(settings.constraints || Array.isArray(settings.constraints))) {
          models[model].constraints = []
        }

        models[model].constraints.push('foreign')
      }

      // add constraints
      if ("constraints" in settings) {
        console.log("constraints", settings.constraints)
        settings.constraints.forEach(fn => {
          let columnSchemaString = `table.${fn}('${column}')`

          if (fn === 'foreign') {
            columnSchemaString = columnSchemaString.concat(`.references('${settings.references}')`)

            // set foreign key events
            const events = ['onDelete', 'onUpdate']
            events.forEach(fn => {
              if (fn in settings) {
                settings[fn] = settings[fn].toUpperCase()
                columnSchemaString = columnSchemaString.concat(`.${fn}('${settings[fn]}')`)
              }
            })
          }

          tableSchemaString.push(columnSchemaString)
        })
      }
    }

    // set as function 
    // used as: knex.schema.createTable(tableName, (table) => {...tableSchemaString...})
    SQL[model] = tableSchemaString.join(';')
  }


  if (options.debug) {
    console.log(SQL)
  }

  return SQL
}

const up = async (knex, models) => {
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
const down = async (knex, models) => {
  for (const model in models) {
    try {
      await knex.raw(`DROP TABLE IF EXISTS "${model}" CASCADE`)
      console.log(`\x1b[31m[Table ${model} removed]\x1b[0m`)
    } catch (err) {
      console.error(err.detail)
    }
  }
}


module.exports = { generateSchemaSQL, generateColumnType, up, down }