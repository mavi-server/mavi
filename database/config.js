// database config
// import dotenv from 'dotenv'
// dotenv.config({ path: '../.env' }) // required for cli to work (db:<command>)

export default {
  development: {
    client: 'pg',
    version: import.meta.env.DB_VERSION || 1,
    connection: {
      database: import.meta.env.DB_NAME,
      user: import.meta.env.DB_USER,
      password: import.meta.env.DB_PASS
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
    version: import.meta.env.DB_VERSION || 1,
    connection: {
      database: import.meta.env.DB_NAME,
      user: import.meta.env.DB_USER,
      password: import.meta.env.DB_PASS
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
