// Main api file

const express = require('express')
const path = require('path')
const responseTime = require('response-time')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const app = express()

require('dotenv').config({ path: path.join(process.cwd(), '.env') })

const routes = require('./router')
const knex = require('../database/knex')
const controllers = require('./router/controllers')
const auth = require('./plugins/auth')
const ipx = require('../ipx/index')

const config = require('./config')

const initializer = (req, res, next) => {
  req.app.db = knex
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
app.use('/ipx', timer, ipx)

// app.listen(process.env.SERVER_PORT, () => {
//   console.log(`[${process.env.SERVER_PORT}] Server is running`)
// })

module.exports = app