// # Main api file
const express = require('express')
const path = require('path')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const responseTime = require('response-time')
const app = express()

// Main Type
import BlueServer from './types'

// Env variables
require('dotenv').config({ path: path.resolve('.env') })

// Functionality
const createDatabase = require('./database')
const createRouter = require('./api/router')
const controllers = require('./api/router/controllers')
const plugins = require('./api/plugins')

// Services
const validateConfig = require('./api/services/validate-config')

// Db instance
let database = null

// Main
export const createServer: BlueServer.createServer = async (object: BlueServer.config) => {
  const config: BlueServer.config = await validateConfig(object).catch((err) => {
    console.error('[validateConfig]', err)
    process.exit(1)
  })
  const HOST = config.host || 'localhost'
  const PORT = config.port || 3000

  // Connect to the database
  database = createDatabase(config.database)

  // Initialize
  app.use(express.json())
  app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
  app.use(cookieParser())
  app.use(cors(config.cors))
  app.use(initializer(config)) // Set req.app properties  
  app.use(`${config.api.base}`, timer, createRouter(config.api, { name: 'api' })) // Primary router is api

  // Set plugins
  if (config.api.plugins) {
    // Check plugins configuration
    for (const plugin in config.api.plugins) {
      if (plugin in plugins) {
        const pluginConfig = {
          routes: plugins[plugin].routes,
          define: config.api.define // uses the same `define` as the api (for now)
        }

        // Set plugin as Router
        app.use(`${config.api.base}/${plugin}`, timer, createRouter(pluginConfig, { name: plugin, isPlugin: true }))
      }

      // custom plugins
      else {
        console.error(`Plugin ${plugin} not found`)
        continue
      }
    }
  }


  // Blue-Server static folders
  if (config.static) {
    for (const Static of config.static) {
      // virtual path
      const Base = Static.base || Static.folder.replace(/../g, '') || '/'

      // physical path
      const Path = path.join(config.__dirname, Static.folder)

      // set static folder
      app.use(Base, timer, express.static(Path, Static.options)) // Primary static folders
    }
  }

  // API static folders
  if (config.api.static) {
    for (const Static of config.api.static) {
      // virtual path
      const Base = path.join(config.api.base, Static.base || Static.folder.replace(/../g, '')).replace(/\\/g, '/')
      // physical path
      const Path = (Static.fullpath || path.join(process.cwd(), Static.folder)).replace(/\\/g, '/')

      // set static folder
      app.use(Base, timer, express.static(Path, Static.options))
    }
  }

  app.listen(PORT, HOST, () => {
    console.log(`\x1b[34m${config.poweredBy} is running\x1b[0m`)
    console.log(`\x1b[34mNetwork:\x1b[0m http://${HOST}:${PORT}`)
  })

  return app
}

const timer = responseTime((req, res, time) => {
  console.log(`\x1b[33m[${req.method}]\x1b[0m \x1b[34m${req.url}\x1b[0m ${time.toFixed(0)}ms`);
})
const initializer = (config) => (req, res, next) => {
  // set req.app properties
  req.app.$config = config
  req.app.db = database
  req.app.controllers = controllers

  // app name
  res.set('X-Powered-By', config.poweredBy)
  next()
}