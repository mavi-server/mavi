/**
 * @description Create trigger functions
 * @param {any} knex
 */
module.exports = async knex => {
  const triggerFunctions = {
    // default triggers:
    // ON_UPDATE_TIMESTAMP_SQL is required for postgres
    ON_UPDATE_TIMESTAMP_SQL: `
      CREATE OR REPLACE FUNCTION on_update_timestamp()
        RETURNS trigger AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
      $$ language 'plpgsql';
    `,
    // later this object can be moved to database config
  };

  for (const fn in triggerFunctions) {
    await knex
      .raw(triggerFunctions[fn])
      .then(() => {
        // log created functions
        console.log(`\x1b[32m[Function ${fn} created]\x1b[0m`);
      })
      .catch(err => {
        // log error
        console.log(`\x1b[31m[Function ${fn} error]\x1b[0m`, err);
      });
  }
};
