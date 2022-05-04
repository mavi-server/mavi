/**
 * @description Seed models if not seeded
 * @param {import('../../../../types').Mavi.config} config
 * @param {{modelsDir: string}} options
 * @returns {Promise<void>}
 */
module.exports = async (config, { modelsDir }) => {
  const { existsSync } = require('fs');
  const { join } = require('path');

  // Check env variables are set:
  require('../../utils/checkEnv');

  // Database connection
  const knex = require('../../../../database')(config.database);

  // Utils
  const updateModelSeedStatus = (model, status) => {
    // Update the database state for this model
    return knex(process.env.DB_STATE)
      .where({ model_hash: model.hash || model.model_hash })
      .update({ model_seeded: status });
  };

  const dbStateExists = await knex.schema.hasTable(process.env.DB_STATE);

  if (dbStateExists) {
    // Get database state models
    const db_models = await knex
      .select('*')
      .from(process.env.DB_STATE)
      .orderBy('created_at', 'asc');

    // Seed tables if seedable and not seeded before
    await Promise.all(
      db_models.map(async row => {
        // Check if the model is already seeded
        const isSeededBefore = row.model_seeded;
        const key = row.model_name;

        // If model is not seeded
        if (!isSeededBefore) {
          let seeds = []; // seed dataset
          const seedFile = `${key}.seed.js`;
          const seedFilePath = join(modelsDir, seedFile);
          const seedFileExists = existsSync(seedFilePath);

          if (seedFileExists) {
            seeds = require(seedFilePath);
          } else if (
            config.api.define.seeds &&
            key in config.api.define.seeds
          ) {
            seeds = config.api.define.seeds[key];
          } else {
            console.error(`${key} \x1b[31mseeds are not available\x1b[0m`);
          }

          // If seed data exists
          if (Array.isArray(seeds) && seeds.length) {
            // Seed the model
            await knex(key)
              .insert(seeds)
              .then(async () => {
                await updateModelSeedStatus(row, true);
                console.log(`\x1b[32m[Table ${key} seeded]\x1b[0m`);
              });
          }
        }

        return true;
      })
    );
  }

  return knex;
};
