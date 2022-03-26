const path = require('path');
const modelsTable = 'DATABASE_STATE';
const configPath = path.join(process.cwd(), './index.js');
const config = require(configPath);

// Database connection
const knex = require(path.join(__dirname, '../../../database'))(config.database);

// remove modelsTable:
const DB_STATE = knex.schema.hasTable(modelsTable);
if (DB_STATE) {
  knex.schema.dropTable(modelsTable).then(() => {
    console.log('\x1b[34mModels removed!\x1b[0m');
    process.exit(0);
  });
}