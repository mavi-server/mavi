import express from 'express'
import responseTime from 'response-time'
import cors from 'cors'
import knex from 'knex'
import cookieParser from 'cookie-parser'

import { createRouter } from './router/index'
import auth from './plugin/auth/index.js'
// import ipx from '../ipx'
import controllers from './router/controllers.js'

import defaultServerConfigs from './config/index.js'


const serverInitializer = (config) => {
  const mode = import.meta.env.MODE || 'development'
  const databaseConfig = mode === 'production' ? config.database.production : config.database.development

  const app = express()
  const db = knex(databaseConfig)
  const routes = createRouter(config)
  const configs = { ...defaultServerConfigs, ...config }

  const appInitializer = (req, res, next) => {
    req.app.db = db
    req.app.controllers = controllers
    next()
  }
  const timer = responseTime((req, res, time) => {
    console.log(`[${req.method}] ${req.url} \x1b[33m${time.toFixed(0)}ms`);
  })

  app.use(cors(configs.cors))
  app.use(express.json())
  app.use(cookieParser())
  app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
  app.use(appInitializer)


  app.use('/api', timer, routes)
  app.use('/api/auth', timer, auth)
  // app.use('/ipx', timer, ipx)

  return app
}
export const createServer = serverInitializer