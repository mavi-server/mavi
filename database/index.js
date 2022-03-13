// Knex Documentation: https://knexjs.org/
const knex = require('knex')
const mode = process.env.NODE_ENV || 'development'

const createDatabase = (database) => {
  if (mode in database) {
    const config = database[mode]

    // if (config.debug === true) {
    //   let counter = 0
    //   knex.on('query', function (data) {
    //     counter++
    //     console.log(`[${counter}. sql]`, `\x1b[35m${data.sql}\x1b[0m`, data.bindings)
    //   })
    //   knex.on('query-error', function (err) {
    //     throw Error(err.message)
    //   })
    // }

    return knex(config)
  }
  else {
    throw new Error(`Database mode \x1b[31m${mode}\x1b[0m not found`)
  }
}

module.exports = createDatabase