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
  app.use(`${config.api.base}`, timer, createRouter(config.api)) // Default plugin is api
  app.use(`${config.api.base}/auth`, timer, createRouter(plugins.auth)) // Default plugin for auth

  // Set static folders
  for (const Static of config.api.static) {
    // virtual path
    const Base = path.join(config.api.base, Static.base || Static.folder.replace('.', '')).replace(/\\/g, '/')
    // physical path
    const Path = (Static.fullpath || path.join(process.cwd(), Static.folder)).replace(/\\/g, '/')

    // set static folder
    app.use(Base, express.static(Path, Static.options))
    // console.log(Base, Path)
  }

  // Set plugins
  // if (config.api.plugins) {
  //   // additional routes
  //   for (const name in config.api.plugins) {
  //     // default plugins
  //     if (plugins[name]) {
  //       const pluginConfig = {
  //         routes: { [name]: plugins[name] },
  //         define: config.api.define
  //       }

  //       app.use(`/${name}/`, timer, createRouter(pluginConfig))
  //     }

  //     // custom plugins
  //     else {
  //       console.error(`Plugin ${name} not found`)
  //       continue
  //     }
  //   }
  // }


  app.listen(PORT, HOST, () => {
    console.log(`[${HOST}:${PORT}] Server is running`)
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