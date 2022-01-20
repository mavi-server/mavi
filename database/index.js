// The knex object https://knexjs.org/
const createDatabase = (config) => {
  const mode = process.env.NODE_ENV || 'development'
  const cfg = mode === 'production' ? config.production : config.development
  const knex = require('knex')(cfg)

  // if (cfg.debug === true) {
  //   let counter = 0
  //   knex.on('query', function (data) {
  //     counter++
  //     console.log(`[${counter}. sql]`, `\x1b[35m${data.sql}\x1b[0m`, data.bindings)
  //   })
  //   knex.on('query-error', function (err) {
  //     throw new Error(err.message)
  //   })
  // }

  return knex
}

module.exports = createDatabase