// # Main api file
const express = require('express');
const { resolve } = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const responseTime = require('response-time');
const app = express();

// Env variables
require('dotenv').config({ path: resolve('.env') });

// Functionality
const createDatabase = require('./database');
const createRouter = require('./api/router');
const controller = require('./api/controller');

// Services
const validateConfig = require('./api/services/validate-config');

// Db instance
let database = null;

/**
 * @type {import('./types').Mavi.createServer}
 * @description Initializes the app with the given config.
 */
const createServer = async object => {
  /**
   * @type {Mavi.config}
   */
  const config = await validateConfig(object).catch(err => {
    console.error('[validateConfig]', err);
    process.exit(1);
  });
  const HOST = config.host || 'localhost';
  const PORT = config.port || 3000;

  // Connect to the database
  database = createDatabase(config.database);

  // Initialize
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
  app.use(cookieParser());
  app.use(cors(config.cors));
  app.use(initializer(config)); // Set req.app properties

  // Mavi - Interface Router
  if (config.page) {
    // user can't/shouldn't define config.page but can deactivate it

    const settings = {
      base: '/',
      routes: {},
      define: {
        models: {},
      },
    };

    // if its a string, it can be one of the predefined static paths: interface, welcome
    if (typeof config.page === 'string') {
      settings.routes['/'] = require(`./config/static/${config.page}`);
    } else {
      settings.routes['/'] = [];
    }

    // Mavi - Interface Router
    app.use(
      await createRouter(settings, {
        root: config.rootdir || __dirname, // using root directory
        name: 'UI',
        debug: true,
      })
    );
  }

  // Mavi - Primary router
  app.use(
    `${config.api.base}`,
    timer,
    await createRouter(config.api, {
      root: config.workdir || process.cwd(), // using work directory
      name: 'Mavi',
      debug: true,
    })
  );

  // Start the server
  if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, HOST, () => {
      console.log(`\x1b[34m${config.poweredBy} is running\x1b[0m`);
      console.log(`\x1b[34mNetwork:\x1b[0m http://${HOST}:${PORT}`);
    });
  }

  return app;
};

const timer = responseTime((req, res, time) => {
  if (req.app.$config.timer === true) {
    console.log(
      `\x1b[33m[${req.method}]\x1b[0m \x1b[34m${req.originalUrl} \x1b[0m(${
        res.statusCode
      }) - ${time.toFixed(0)}ms`
    );
  }
});
const initializer = config => (req, res, next) => {
  // set req.app properties
  req.app.$config = config;
  req.app.db = database;
  req.app.controller = controller;

  // app name
  res.set('X-Powered-By', config.poweredBy);

  // ready
  next();
};

exports.createServer = createServer;
