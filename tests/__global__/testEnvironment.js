const NodeEnvironment = require('jest-environment-node');
const { join } = require('path');
const request = require('supertest');
const mavi = {
  start: require('../../index').createServer,
  apply: require('../../cli/src/commands/apply'),
  seed: require('../../cli/src/commands/seed'),
  clear: require('../../cli/src/commands/clear'),
  drop: require('../../cli/src/commands/drop'),
  config: require('../../examples/example2'),
  server: undefined,
};

// Database connection for testing
// Be sure you have a database configured in local machine
mavi.config.database.test = {
  client: 'pg',
  connection: {
    database: 'test',
    user: 'postgres',
    password: 'admin',
  },
};

class CustomEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);

    // Set working directory
    mavi.config.workdir = join(process.cwd(), 'examples/example2');
  }

  async setup() {
    // Create database and with datasets
    await mavi.apply(mavi.config);
    await mavi.seed(mavi.config);

    // Create server
    mavi.server = await mavi.start(mavi.config);

    // Set global variables
    this.global.mavi = mavi;
    this.global.request = request;
  }

  // async teardown() {
  //   // Drop test database
  //   await mavi.drop(mavi.config);
  // }
}

module.exports = CustomEnvironment;
