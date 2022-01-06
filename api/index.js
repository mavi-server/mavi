// # Main api file
const express = require('express')
const path = require('path')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const responseTime = require('response-time')
const app = express()
const pkg = require('../package.json')

require('dotenv').config({ path: path.join(process.cwd(), '.env') })

// Default server configuration
const $config = require('../config')

// Functionality
const database = require('../database')
const router = require('./router')
const controllers = require('./router/controllers')
const plugins = require('./plugins')

const createServer = async object =>{
  const config = await validateConfig(object).catch(err => err)
  const PORT = config.port || process.env.SERVER_PORT || 3000

  app.use(express.json())
  app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
  app.use(cookieParser())
  app.use(cors(config.cors))
  app.use(initializer(config)) // Set req.app properties
  app.use('/api', timer, router(config.api)) // Default plugin is api
  app.use(`/api/auth`, timer, router(plugins.auth)) // Default plugin for auth

  // Set plugins / hydrate plugins
  // if (config.api.plugins) {
  //   // additional routes
  //   for (const name in config.api.plugins) {
  //     // default plugins
  //     if (plugins[name]) {
  //       const pluginConfig = {
  //         routes: { [name]: plugins[name] },
  //         define: config.api.define
  //       }
        
  //       app.use(`/${name}/`, timer, router(pluginConfig))
  //     }
      
  //     // custom plugins
  //     else {
  //       console.error(`Plugin ${name} not found`)
  //       continue
  //     }
  //   }
  // }
  
  app.listen(PORT, () => {
    console.log(`[${PORT}] Server is running`)
  })

  return app
}

const validateConfig = async (config) => {
  if (config.database && !(config.database.development || config.database.production)) {
    throw new Error('Invalid database config')
  }

  if (!config.api) {
    throw new Error('Invalid api config')
  }

  if (config.api.routes && typeof config.api.routes !== 'object') {
    throw new Error('Invalid api routes config')
  }

  // assign default configs if not provided
  for (const key in $config) {
    if (!config[key]) config[key] = $config[key]
  }

  return config
}

const timer = responseTime((req, res, time) => {
  console.log(`\x1b[33m[${req.method}]\x1b[0m \x1b[34m${req.url}\x1b[0m ${time.toFixed(0)}ms`);
})
const initializer = (config) => (req, res, next) => {
  // set req.app properties
  req.app.$config = config
  req.app.db = database(config.database)
  req.app.controllers = controllers

  // app name
  res.set('X-Powered-By', config.poweredBy || `Blue Server v${pkg.version}`)
  next()
}

// development
if (process.argv[2] === '--dev') {
  createServer($config)
}

module.exports = { createServer }