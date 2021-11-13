import knex from 'knex'
import config from './config'
const mode = process.env.NODE_ENV || 'development'
const cfg = mode === 'production' ? config.production : config.development
const db = knex(cfg)

// let sqlCount = 0
// db.on('query', function (data) {
//   sqlCount++
//   console.log(sqlCount, data.sql)
// })
// db.on('query-errpr', function (err) {
//   throw new Error(err.message)
// })

export default db