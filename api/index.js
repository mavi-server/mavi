// # Main api file
const express = require('express')
const path = require('path')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const responseTime = require('response-time')
const app = express()

require('dotenv').config({ path: path.join(process.cwd(), '.env') })

// Default server configuration
const $config = require('../config')

// Functionality
const database = require('../database')
const router = require('./router')
const controllers = require('./router/controllers')

// Plugin configs
// const auth = require('./plugins/auth')
// const ipx = require('./plugins/ipx')

function main(config) {
  validateConfig(config).catch(err => err)
  const PORT = config.port || process.env.SERVER_PORT || 3000

  app.use(express.json())
  app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
  app.use(cookieParser())
  app.use(cors(config.cors))
  app.use(initializer(config.database))
  app.use('/api', timer, router(config.api))
  // app.use('/auth', timer, createRouter(auth))
  // app.use('/ipx', timer, ipx)

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
    if (!config[key]) Object.assign(config, { [key]: $config[key] })
  }
}
const timer = responseTime((req, res, time) => {
  console.log(`\x1b[33m[${req.method}]\x1b[0m \x1b[34m${req.url}\x1b[0m ${time.toFixed(0)}ms`);
})
const initializer = (config) => (req, res, next) => {
  req.app.db = database(config)
  req.app.controllers = controllers
  next()
}

// development
if (process.argv[2] === '--dev') {
  main($config)
}

module.exports = main