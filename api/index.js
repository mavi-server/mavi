import express from 'express'
import knex from 'knex'
import cors from 'cors'
import responseTime from 'response-time'
import cookieParser from 'cookie-parser'

import { createRouter, controllers } from './router/index'
import auth from './plugin/auth/index.js'
// import ipx from '../ipx'

import defaultServerConfigs from './config/index.js'


const serverInitializer = (config) => {
  const app = express()
  const db = knex(config.database)
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