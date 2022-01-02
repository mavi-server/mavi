// Database Config
require('dotenv').config({ path: '../../.env' }) // required for npm migrate scripts

module.exports = {
  development: {
    client: 'pg',
    version: 0.2,
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
    }
  },

  production: {
    client: 'pg',
    version: 0.2,
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
    }
  }
};
