'use strict';

require('dotenv');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const responseTime = require('response-time');
const app = express();

const createDatabase = require('./database');
const createRouter = require('./api/router');
const controller = require('./api/controller');
const validateConfig = require('./api/services/validate-config');

// timer util:
const timer = responseTime((req, res, time) => {
  if (req.app.$config.timer === true) {
    console.log(
      `\x1b[33m[${req.method}]\x1b[0m \x1b[34m${req.originalUrl} \x1b[0m(${res.statusCode
      }) - ${time.toFixed(0)}ms`
    );
  }
});

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

  // Initialize
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
  app.use(cookieParser());
  app.use(cors(config.cors));
  app.use(initializer(config)); // Set req.app properties
  let adminRouter, primaryRouter

  // Mavi - Admin Router
  if (config.page) {
    // user shouldn't define config.page but can deactivate it

    const configAdmin = {
      base: '/',
      routes: {},
      define: {
        models: {},
      },
    };

    // if its a string, it can be one of the predefined static paths: admin, welcome
    if (typeof config.page === 'string') {
      configAdmin.routes['/'] = require(`./config/static/${config.page}`);
    } else {
      configAdmin.routes['/'] = [];
    }

    adminRouter = await createRouter(configAdmin, {
      root: __dirname, // using root directory
      name: 'UI',
      debug: true,
    })

    // Use router
    app.use(adminRouter)
  }

  // Mavi - Primary router
  primaryRouter = await createRouter(config.api, {
    root: process.cwd(), // using work directory
    name: 'Mavi',
    debug: true,
  })

  // Use router
  app.use(primaryRouter, timer)

  // Start the server
  const server = app.listen(PORT, HOST, () => {
    console.log(`\x1b[34m${config.poweredBy} is running\x1b[0m`);
    console.log(`\x1b[34mNetwork:\x1b[0m http://${HOST}:${PORT}`);
  });

  return server;
};

const initializer = config => (req, res, next) => {
  // set req.app properties
  req.app.db = createDatabase(config.database);
  req.app.$config = config;
  req.app.controller = controller;

  // app name
  res.set('X-Powered-By', config.poweredBy);

  // ready
  next();
};

exports.createServer = createServer;
