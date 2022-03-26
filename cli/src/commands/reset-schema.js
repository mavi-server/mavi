const path = require('path');
const schema = 'public';
const configPath = path.join(process.cwd(), './index.js');
const config = require(configPath);

// Database connection
const knex = require(path.join(__dirname, '../../../database'))(config.database);

// drop schema
knex.schema.dropSchemaIfExists(schema, true).then(async () => {
  // create schema
  await knex.raw(`CREATE SCHEMA ${schema}`);

  // exit process
  process.exit(0);
});




