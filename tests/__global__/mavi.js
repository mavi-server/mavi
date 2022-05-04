(async () => {
  const { createServer } = require('../../index');
  const config = require('../../examples/example2');

  // Database connection for testing
  // Be sure you have a database configured in local machine
  config.database.test = {
    client: 'pg',
    connection: {
      database: 'mavi-test',
      user: 'postgres',
      password: 'admin',
    },
  };

  const mavi = {
    config,
    server: await createServer(config),
    cli: {
      apply: require('../../cli/src/commands/apply'),
      seed: require('../../cli/src/commands/seed'),
    },
  };

  global.mavi = mavi;
  global.request = require('supertest');
})();
