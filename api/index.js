import express from 'express'
import knex from 'knex'
import cors from 'cors'
import responseTime from 'response-time'
import cookieParser from 'cookie-parser'

import { createRouter, controllers } from './router/index.js'
import auth from './plugin/auth/index.js'
// import ipx from '../ipx'

import defaultServerConfigs from './config/index.js'


const Initializer = (config) => {
  if (!config || typeof config !== 'object') {
    throw new Error('Please provide a config as json object')
  }

  // assign default configs
  const configs = { ...defaultServerConfigs, ...config }

  if (!configs.database) {
    throw new Error('Please provide a database connection')
  }

  const app = express()
  const db = knex(configs.database)
  const routes = createRouter(configs)

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

export const api = Initializer // works with outer configs
export const devServer = Initializer(defaultServerConfigs)