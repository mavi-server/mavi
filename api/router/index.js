// Generate router from the given routes
const express = require('express')
const hydrateRoutes = require('./utils/hydrate-routes')
const $router = express.Router()
// const $routes = require('./config')

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

const setMiddlewares = fn => {
  if (typeof fn === 'function') return fn()
  else if (typeof fn === 'string') return middlewares[fn]
  else throw Error('Please define blue-server middlewares')
}

const createRouter = ({ routes, define }) => {
  if (!routes) throw Error('Please define blue-server routes')
  else if (!define) throw Error('Please define blue-server define')

  const $routes = hydrateRoutes({ routes, define }) // global routes

  // set defined middlewares
  if (define && define.middlewares) {
    for (const key in define.middlewares) {
      middlewares[key] = define.middlewares[key]
    }
  }
  // set defined utils
  if (define && define.utils) {
    for (const key in define.utils) {
      utils[key] = define.utils[key]
    }
  }

  for (const model in $routes) {
    const routes = $routes[model] // local routes
    if (!routes) throw Error(`Please define blue-server routes for ${model}`)

    // Use route configs to generate router
    for (const config of routes) {
      if (config.method && !['get', 'post', 'put', 'delete'].includes(config.method.toLowerCase())) {
        res.error = {
          status: 500,
          message: 'Invalid request method'
        }
      }

      // Generate router
      $router[config.method](config.path, ...config.middlewares.map(setMiddlewares), async (req, res) => {
        // controller settings
        req.config = config
        req.config.model = model

        // execute utils
        await Promise.all(config.utils.map(function (fn) {
          if (utils[fn]) {
            req.body = utils[fn](req.body, config)
          } else console.error('utils function not found:', fn)
          return req.body
        }))


        // params & datas
        const data = req.body
        const { id, folder } = req.params

        if (typeof config.controller === 'function') {
          return config.controller(req, res)
        }

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
    }
  }

  // Router is ready
  return $router
}

module.exports = createRouter