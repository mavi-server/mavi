// Generate router from the given routes
const express = require('express')
const hydrateRoutes = require('./utils/hydrate-routes')
const $router = express.Router()
const { join } = require('path')
const routers = { api: 0, static: 0 }

// Default middlewares
const middlewares = {
  authorization: require('../middlewares/authorization'),
  interceptor: require('../middlewares/interceptor'),
  'is-owner': require('../middlewares/is-owner'),
}

// Default utils
const utils = {
  'detect-language': require('../utils/detect-language'),
  sanitize: require('../utils/sanitize'),
}

// Default controllers
const controllers = ['count', 'find', 'findOne', 'create', 'delete', 'update', 'upload', 'login', 'logout', 'register']

const setMiddlewares = (fn) => {
  if (typeof fn === 'function') return fn()
  else if (typeof fn === 'string') return middlewares[fn]
  else throw Error('Please define mavi middlewares')
}

const createRouter = ({ routes, define }, options) => {
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

    // Use model.route.config to generate router
    for (const config of routes) {
      if (
        config.method &&
        !['get', 'post', 'put', 'delete', 'head', 'connect', 'trace', 'patch'].includes(config.method.toLowerCase())
      ) {
        return res.status(400).send('Invalid request method')
      }

      // Generate static routes: // https://expressjs.com/en/4x/api.html#express.static
      if ('serve' in config) {
        // virtual path
        const Base = config.path

        // physical path
        const Path = (config.fullpath || join(process.cwd(), config.folder)).replace(/\\/g, '/')

        // set static folder
        $router.use(Base, ...config.middlewares.map(setMiddlewares), express.static(Path, config.serve))

        if (options.debug) {
          routers.static++
          // colorful log:
          // console.log(`\x1b[36mServing  \x1b[32m[${config.method}]${config.path}\x1b[36m path from \x1b[35m${Path}\x1b[0m`,)
        }
      }

      // Generate api routes:
      else {
        $router[config.method](config.path, ...config.middlewares.map(setMiddlewares), async (req, res) => {
          // controller settings
          req.config = config

          // if user didn't assign models, use current model
          if (!req.config.model) {
            req.config.model = model
          }

          // execute utils
          if (config.utils)
            await Promise.all(
              config.utils.map(function (fn) {
                if (utils[fn]) {
                  req.body = utils[fn](req.body, config)
                } else console.error('Utility function not found:', `${model}.utils: [${fn}]`)
                return req.body
              }),
            )

          // Use controller directly which is defined in routes[x].controller
          if (typeof config.controller === 'function') {
            return config.controller(req, res)
          }

          // Use custom controllers: (comes first because users can overwrite the default controllers)
          else if (config.controller in define.controllers) {
            // execute defined controller
            return await define.controllers[config.controller](req, res)
          }

          // Use default controllers
          else if (controllers.includes(config.controller) || config.view) {
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
                break
              case 'create':
                $arguments = [data]
                break
              case 'delete':
                $arguments = [id]
                break
              case 'update':
                $arguments = [id, data]
                break
              case 'upload':
                $arguments = [folder, data]
                break
              case 'login':
              case 'logout':
              case 'register':
                $arguments = [req, res]
            }

            if (config.view && !config.controller) {
              // execute controller with only view
              return await req.app.controller(req, res).find()
            }
            else {
              // execute controller
              return await req.app.controller(req, res)[config.controller](...$arguments)
            }
          }
          else {
            // controller not found
            return res.status(500).send('Controller not found')
          }
        })
      }

      if (options.debug) {
        // colorful log:
        // console.log(
        //   `\x1b[36mCreating \x1b[32m[${config.method}] ${config.path}\x1b[36m ${options.name} path\x1b[0m`)
        routers.api++
      }
    }
  }

  // colorful log:
  console.log(
    `\x1b[36mRouter is ready: \x1b[32m${routers.api + routers.static} route ${routers.api + routes.static ? 'is' : 'are'
    } created \x1b[33m${routers.static} ${routers.static ? 'is' : 'are'} serving as a static path\x1b[0m`,
  )

  // Router is ready
  return $router
}

module.exports = createRouter
