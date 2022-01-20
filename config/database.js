// Database Config
require('dotenv').config({ path: `../.env` })

module.exports = {
  development: {
    client: 'pg',
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
      tableName: 'knex_migrations',
      stub: 'migration.stub.js',
      // disableMigrationsListValidation: true,
    },
    seeds: {
      directory: './migrations',
    },
    debug: false,
  },

  production: {
    client: 'pg',
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
      tableName: 'knex_migrations',
      stub: 'migration.stub.js',
      // disableMigrationsListValidation: true,
    },
    seeds: {
      directory: './migrations',
    },
    debug: false,
  }
};
