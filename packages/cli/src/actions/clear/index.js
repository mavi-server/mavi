module.exports = async config => {
  // Database connection
  const knex = require('knex')(config.database[config.mode]);

  // Utils
  const updateModelSeedStatus = (model, status) => {
    // Update the database state for this model
    return knex(process.env.DB_STATE)
      .where({ model_hash: model.hash || model.model_hash })
      .update({ model_seeded: status });
  };

  // Clear model tables:
  for (const key in config.api.define.models) {
    const model = config.api.define.models[key];
    const exists = await knex.schema.hasTable(key);

    if (exists) {
      await knex.raw(`TRUNCATE TABLE ${key} RESTART IDENTITY CASCADE`);
      await updateModelSeedStatus(model, false);
      console.log(`Cleared table \x1b[31m${key}\x1b[0m`);
    }
  }

  return knex;
};
