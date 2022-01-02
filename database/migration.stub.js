// When you create a migration, this will be used as a template

let Tables = require('../utils/generate-tables.js')
const Seeds = require('../seeds/index')
const tables = Object.keys(Tables)

exports.up = async function (knex) {
  const execString = tables.reduce((string, key) => {
    return string.concat(`.createTable("${key}", ${Tables[key]})`)
  }, 'knex.schema')

  try {
    return eval(execString)
  } catch (err) {
    console.error(err.detail)
  }
}

exports.down = async function (knex) {
  // remove migration tables first:
  // await knex.raw(`DROP TABLE IF EXISTS "knex_migrations" CASCADE`)
  // await knex.raw(`DROP TABLE IF EXISTS "knex_migrations_lock" CASCADE`)

  return Promise.all(tables.map(async function (table) {
    try {
      console.log(table, 'down start')
      await knex.raw(`DROP TABLE IF EXISTS "${table}" CASCADE`)
      console.log(table, 'down finish')
    } catch (err) {
      console.error(err.detail)
    }

    return true
  }))
}


exports.seed = function (knex) {
  const seeds = Object.keys(Seeds)
  const sqlString = seeds.reduce((string, table) => {
    return string += knex(table).insert(Seeds[table]).toString() + ';'
  }, '')

  return knex.raw(sqlString)
}