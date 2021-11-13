import generateTables from '../utils/generate-tables'
import seedsIndex from '../seeds'
let Tables = generateTables
const Seeds = seedsIndex
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

exports.down = function (knex) {
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