const path = require('path');
const SCHEMA = 'public';
const configPath = path.join(process.cwd(), './index.js');
const config = require(configPath);

// Database connection
const knex = require(path.join(__dirname, '../../../database'))(config.database);

// drop schema
module.exports = () => {
  return knex.schema.dropSchemaIfExists(SCHEMA, true).then(async () => {
  // create schema
    await knex.raw(`CREATE SCHEMA ${SCHEMA}`);
  });
};