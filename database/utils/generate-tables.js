import models from '../models'
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
export default Tables