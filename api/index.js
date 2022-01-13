// # Main api file
const express = require('express')
const path = require('path')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const responseTime = require('response-time')
const app = express()

require('dotenv').config({ path: path.resolve('.env') })

// Functionality
const database = require('../database')
const router = require('./router')
const controllers = require('./router/controllers')
const plugins = require('./plugins')

// Services
const validateConfig = require('./services/validate-config')

const createServer = async (object) => {
  const config = await validateConfig(object).catch(err => {
    console.error('[validateConfig]', err)
    process.exit(1)
  })
  const HOST = config.host || 'localhost'
  const PORT = config.port || 3000

  app.use(express.json())
  app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
  app.use(cookieParser())
  app.use(cors(config.cors))
  app.use(initializer(config)) // Set req.app properties
  app.use(path.join(config.api.base), timer, router(config.api)) // Default plugin is api
  app.use(path.join(config.api.base, 'auth'), timer, router(plugins.auth)) // Default plugin for auth

  // Set static folders
  for (const static of config.api.static) {
    // virtual path
    const Base = path.join(config.api.base, static.base || static.folder.replace('.', '')).replace(/\\/g, '/')
    // physical path
    const Path = (static.fullpath || path.join(process.cwd(), static.folder)).replace(/\\/g, '/')

    // set static folder
    app.use(Base, express.static(Path, static.options))
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

  //       app.use(`/${name}/`, timer, router(pluginConfig))
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
  req.app.db = database(config.database)
  req.app.controllers = controllers

  // app name
  res.set('X-Powered-By', config.poweredBy)
  next()
}

module.exports = { createServer }