// Knex Documentation: https://knexjs.org/
const mode = (process.env.NODE_ENV || 'development').toLowerCase()

const createDatabase = (database) => {
  const cfg = mode === 'production' ? database.production : database.development
  const knex = require('knex')(cfg)

  // if (cfg.debug === true) {
  //   let counter = 0
  //   knex.on('query', function (data) {
  //     counter++
  //     console.log(`[${counter}. sql]`, `\x1b[35m${data.sql}\x1b[0m`, data.bindings)
  //   })
  //   knex.on('query-error', function (err) {
  //     throw Error(err.message)
  //   })
  // }

  return knex
}

module.exports = createDatabase