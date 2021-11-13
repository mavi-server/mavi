// database config
import dotenv from 'dotenv'
dotenv.config({ path: '../.env' }) // required for cli to work (db:<command>)

console.log(process.env.DEV_DB_NAME)

export default {
  development: {
    client: 'pg',
    version: process.env.DEV_DB_VERSION || 1,
    connection: {
      database: process.env.DEV_DB_NAME,
      user: process.env.DEV_DB_USER,
      password: process.env.DEV_DB_PASS
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations',
      // schemaName: 'public',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './migrations'
    }
  },

  production: {
    client: 'pg',
    version: process.env.PRO_DB_VERSION || 1,
    connection: {
      database: process.env.PRO_DB_NAME,
      user: process.env.PRO_DB_USER,
      password: process.env.PRO_DB_PASS
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: './migrations',
      // schemaName: 'public',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './migrations'
    }
  }
};
