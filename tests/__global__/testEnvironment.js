const NodeEnvironment = require('jest-environment-node');
const { join } = require('path');
const request = require('supertest');
const workdir = join(process.cwd(), 'examples/example2');

const mavi = {
  start: require('../../index').createServer,
  apply: require('../../cli/src/commands/apply'),
  seed: require('../../cli/src/commands/seed'),
  clear: require('../../cli/src/commands/clear'),
  drop: require('../../cli/src/commands/drop'),
  config: require(workdir),
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

// Set working directory
mavi.config.workdir = workdir;

class CustomEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    // Set global variables
    this.global.mavi = mavi;
    this.global.request = request;
  }
}

module.exports = CustomEnvironment;
