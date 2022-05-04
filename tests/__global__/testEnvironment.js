const NodeEnvironment = require('jest-environment-node');
const { createServer } = require('../../index');
const { join } = require('path');
const request = require('supertest');
const config = require('../../examples/example2');
const modelsDir = join(process.cwd(), '/examples/example2/models');
const mavi = {
  cli: {
    apply: require('../../cli/src/commands/apply'),
    seed: require('../../cli/src/commands/seed'),
    clear: require('../../cli/src/commands/clear'),
    drop: require('../../cli/src/commands/drop'),
  },
  config,
  modelsDir,
  server: undefined,
};

// Database connection for testing
// Be sure you have a database configured in local machine
config.database.test = {
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
  }

  async setup() {
    // Create database and with datasets
    await mavi.cli.apply(mavi.config, { modelsDir });
    await mavi.cli.seed(mavi.config, { modelsDir });

    // Create server
    mavi.server = await createServer(mavi.config);

    // Set global variables
    this.global.mavi = mavi;
    this.global.request = request;
  }

  async teardown() {
    // Drop test database
    await mavi.cli.drop(mavi.config);
  }

  runScript(script) {
    return super.runScript(script);
  }
}

module.exports = CustomEnvironment;
