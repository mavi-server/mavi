// Generate router from the given routes
const express = require('express')
const hydrateRoutes = require('./utils/hydrate-routes')
const $router = express.Router()
// const $routes = require('./config')

// Default middlewares
const middlewares = {
  'authorization': require('../middlewares/authorization'),
  'interceptor': require('../middlewares/interceptor'),
  'is-owner': require('../middlewares/is-owner'),
}

// Default utils
const utils = {
  'detect-language': require('../utils/detect-language'),
  'sanitize': require('../utils/sanitize'),
}

// Default controllers
const controllers = ['count', 'find', 'findOne', 'create', 'delete', 'update', 'upload', 'login', 'logout', 'register']


const setMiddlewares = fn => {
  if (typeof fn === 'function') return fn()
  else if (typeof fn === 'string') return middlewares[fn]
  else throw Error('Please define mavi middlewares')
}

const createRouter = ({ routes, define }, options) => {
  // colorful log:
  console.log(`\x1b[36mCreating \x1b[32m${options.name}\x1b[36m routes ${options.isPlugin ? 'as plugin' : 'as primary'}...\x1b[0m`,)

  if (!routes) throw Error('Please define mavi routes')
  else if (!define) throw Error('Please define mavi define')

  // Set required fields for every route
  const $routes = hydrateRoutes({ routes, define }, options)

  // Set defined properties
  if (define) {
    // set defined middlewares
    if (define.middlewares) {
      for (const key in define.middlewares) {
        middlewares[key] = define.middlewares[key]
      }
    }
    // set defined utils
    if (define.utils) {
      for (const key in define.utils) {
        utils[key] = define.utils[key]
      }
    }
  }

  // Generate router from route configs
  for (const model in $routes) {
    let routes = $routes[model] // local routes
    if (!routes) throw Error(`Please define mavi routes for ${model}`)

    // Use route configs to generate router
    for (const config of routes) {
      if (config.method && !['get', 'post', 'put', 'delete'].includes(config.method.toLowerCase())) {
        res.error = {
          status: 500,
          message: 'Invalid request method'
        }
        return res.status(res.error.status).send(res.error)
      }

      // generate router
      $router[config.method](config.path, ...config.middlewares.map(setMiddlewares), async (req, res) => {
        // controller settings
        req.config = config

        // if user didn't assign models, use current model
        if (!req.config.model) {
          req.config.model = model
        }

        // execute utils
        await Promise.all(config.utils.map(function (fn) {
          if (utils[fn]) {
            req.body = utils[fn](req.body, config)
          } else console.error('utils function not found:', fn)
          return req.body
        }))

        // Use controller directly which is defined in routes[x].controller
        if (typeof config.controller === 'function') {
          return config.controller(req, res)
        }

        // Use custom controllers (comes first because users can overwrite the default controllers)
        else if (config.controller in define.controllers) {
          // execute defined controller
          return await define.controllers[config.controller](req, res)
        }

        // Use default controllers
        else if (controllers.includes(config.controller)) {
          // params & datas
          const data = req.body
          const { id, folder } = req.params
          let $arguments = []

          // set $arguments for default controllers
          switch (config.controller) {
            case 'find':
            case 'count':
            case 'findOne':
              $arguments = []
              break;
            case 'create':
              $arguments = [data]
              break;
            case 'delete':
              $arguments = [id]
              break;
            case 'update':
              $arguments = [id, data]
              break;
            case 'upload':
              $arguments = [folder, data]
              break;
            case 'login':
            case 'logout':
            case 'register':
              $arguments = [req, res]
          }

          // execute default controller
          return await req.app.controllers(req, res)[config.controller](...$arguments)
        }

        else {
          // controller not found
          return res.status(500).send('Controller not found')
        }
      })
    }
  }

  // Router is ready
  return $router
}

module.exports = createRouter