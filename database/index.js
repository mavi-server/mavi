// The knex object https://knexjs.org/
const $config = require('../config/database')

const createDatabase = (config) => {
  const mode = process.env.NODE_ENV || 'development'
  const cfg = mode === 'production' ? config.production : config.development
  const knex = require('knex')(cfg)


  // create triggerFunctions
  for (const fn in $config.triggerFunctions) {
    knex.raw($config.triggerFunctions[fn]).then(() => {
      console.log(`\x1b[32m[Function ${fn} created]\x1b[0m`)
    })
  }

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