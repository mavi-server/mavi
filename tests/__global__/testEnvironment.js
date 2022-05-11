const NodeEnvironment = require('jest-environment-node');
const { join } = require('path');
const request = require('supertest');
const workdir = join(process.cwd(), 'examples/example2');
const glue = require('../../cli/src/utils/glue');

const mavi = {
  start: require('../../index').createServer,
  build: require('../../cli/src/commands/build'),
  seed: require('../../cli/src/commands/seed'),
  clear: require('../../cli/src/commands/clear'),
  drop: require('../../cli/src/commands/drop'),
  config: null,
  server: undefined,
};

// Validate mavi.config and combine it with the projection files
mavi.config = glue({ cwd: workdir });

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

// Special routes for testing query lock features
mavi.config.api.routes['/lock'] = require('../__mocks__/lock-routes/data');

// Set working directory
mavi.config.workdir = workdir;

class CustomEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
  }

  async setup() {
    // Create database and with datasets
    await mavi.build(mavi.config);
    await mavi.seed(mavi.config);

    // Set global variables
    this.global.mavi = mavi;
    this.global.request = request;

    // Start server
    this.global.mavi.server = await mavi.start(mavi.config);
  }

  async teardown() {
    // If server is active
    if (this.global.mavi.server && 'close' in this.global.mavi.server) {
      // Drop test database
      // await mavi.drop(mavi.config); (not working on multiple tests)

      // Close server
      await this.global.mavi.server.close();
    }
  }
}

module.exports = CustomEnvironment;
