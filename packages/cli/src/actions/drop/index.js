module.exports = async config => {
  // Database connection
  const knex = require('../../../../../database')(config.database);

  // Drop database state:
  await knex.schema.hasTable(process.env.DB_STATE).then(exists => {
    if (exists) {
      return knex.schema.dropTable(process.env.DB_STATE);
    }
  });

  // Drop model tables:
  for (const key in config.api.define.models) {
    const exists = await knex.schema.hasTable(key);

    if (exists) {
      await knex
        .raw(`DROP TABLE ${key} CASCADE`)
        .then(() => {
          console.log(`Dropped table \x1b[31m${key}\x1b[0m`);
        })
        .catch(err => {
          console.log(`\x1b[31mError dropping table "${key}"\x1b[0m`);
          console.log(err);
        });
    }
  }

  return knex;
};
