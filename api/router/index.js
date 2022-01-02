const express = require('express')
const router = express.Router()
const routes = require('./config')
const hydrateRoutes = require('./utils/hydrate-routes')
const config = hydrateRoutes(routes)

// Define default middlewares
const middlewares = {
  'authorization': require('../middlewares/authorization'),
  'interceptor': require('../middlewares/interceptor'),
  'is-owner': require('../middlewares/is-owner'),
}

// Define default utils
const utils = {
  'detect-language': require('../utils/detect-language'),
  'sanitize': require('../utils/sanitize'),
}

// Initialize the Router
Object.keys(config).forEach(model => {
  const routes = config[model]

  Promise.all(routes.map(async config => {
    if (config.method && !['get', 'post', 'put', 'delete'].includes(config.method)) { res.status(500).send('Invalid request method') }

    return await router[config.method](config.path, ...config.middlewares.map(fn => middlewares[fn]), async (req, res) => {
      // controller settings
      config.model = model
      req.config = config

      // set utils
      await Promise.all(config.utils.map(function (fn) {
        if (utils[fn]) {
          req.body = utils[fn](req.body, config)
        } else console.error('utils function not found:', fn)
        return req.body
      }))


      // params & datas
      const data = req.body
      const { id, folder } = req.params

      // methods
      switch (config.controller) {
        case 'find':
        case 'count':
        case 'findOne':
          await req.app.controllers(req, res)[config.controller]()
          break;
        case 'create':
          await req.app.controllers(req, res)[config.controller](data)
          break;
        case 'delete':
          await req.app.controllers(req, res)[config.controller](id)
          break;
        case 'update':
          await req.app.controllers(req, res)[config.controller](id, data)
          break;
        case 'upload':
          return await req.app.controllers(req, res)[config.controller](folder, data)
        default:
          res.send(500)
          break;
      }

      if (res.error) {
        return res.status(res.error.status).send(res.error)
      }

      return res.status(200).json(res.data)
    })
  }))
})

module.exports = router