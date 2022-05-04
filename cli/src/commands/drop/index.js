module.exports = async config => {
  // Database connection
  const knex = require('../../../../database')(config.database);

  // Drop database state:
  await knex.schema.hasTable(process.env.DB_STATE).then(exists => {
    if (exists) {
      return knex.schema.dropTable(process.env.DB_STATE);
    }
  });

  // Drop model tables:
  for (const model in config.api.define.models) {
    const exists = await knex.schema.hasTable(model);

    if (exists) {
      // await knex.raw(`TRUNCATE TABLE ${model} RESTART IDENTITY CASCADE`);
      await knex
        .raw(`DROP TABLE ${model} CASCADE`)
        .then(() => {
          console.log(`Dropped table \x1b[31m${model}\x1b[0m`);
        })
        .catch(err => {
          console.log(`\x1b[31mError dropping table "${model}"\x1b[0m`);
          console.log(err);
        });
    }
  }

  return knex;
};
