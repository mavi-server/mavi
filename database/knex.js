// The knex object https://knexjs.org/

const config = require('./config')
const mode = process.env.NODE_ENV || 'development'
const cfg = mode === 'production' ? config.production : config.development
const knex = require('knex')(cfg)

// let sqlCount = 0
// knex.on('query', function (data) {
//   sqlCount++
//   console.log(sqlCount, data.sql)
// })
// knex.on('query-errpr', function (err) {
//   throw new Error(err.message)
// })

module.exports = knex