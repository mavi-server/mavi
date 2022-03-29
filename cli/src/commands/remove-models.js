const path = require('path');
const DB_STATE_TABLE = 'DATABASE_STATE';
const configPath = path.join(process.cwd(), './index.js');
const config = require(configPath);
const knex = require(path.join(__dirname, '../../../database'))(config.database);

module.exports = async () => {
  // drop db state:
  await knex.schema.hasTable(DB_STATE_TABLE).then(exists => {
    if (exists) {
      return knex.schema.dropTable(DB_STATE_TABLE);
    }
  });

  // drop models:
  for (const model in config.api.define.models) {
    await knex.raw(`DROP TABLE IF EXISTS ${model} CASCADE`)
      .then(() => {
        console.log(`\x1b[36mRemoved table "${model}"\x1b[0m`);
      })
      .catch(err => {
        console.log(`\x1b[31mError removing table "${model}"\x1b[0m`);
        console.log(err);
      });
  }  
};
