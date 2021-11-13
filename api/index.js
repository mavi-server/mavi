import express from 'express'
import responseTime from 'response-time';
import cors from 'cors'
import cookieParser from 'cookie-parser';

import routes from './router/index'
import auth from './plugins/auth/index.js'

const app = express()
import controllers from './router/controllers.js';
import db from '../database/knex.js'
// import ipx from '../ipx'

import config from './config/index.js'

const initializer = (req, res, next) => {
  req.app.db = db
  req.app.controllers = controllers
  next()
}
const timer = responseTime((req, res, time) => {
  console.log(`[${req.method}] ${req.url} \x1b[33m${time.toFixed(0)}ms`);
})

app.use(cors(config.cors))
app.use(express.json())
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(initializer)


app.use('/api', timer, routes)
app.use('/api/auth', timer, auth)
// app.use('/ipx', timer, ipx)

export const api = app