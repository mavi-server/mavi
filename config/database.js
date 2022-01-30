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
    debug: false,
  },
  triggerFunctions: {
    ON_UPDATE_TIMESTAMP_SQL: `
      CREATE OR REPLACE FUNCTION on_update_timestamp()
        RETURNS trigger AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
      $$ language 'plpgsql';
    `,
  },
};
