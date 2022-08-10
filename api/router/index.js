// Generate router from the given routes
const express = require('express');
const $router = express.Router();
const hydrateRoutes = require('./utils/hydrate-routes');
const { join } = require('path');

// Default middlewares
const middlewares = {
  authorization: require('../middlewares/authorization'),
  interceptor: require('../middlewares/interceptor'),
  'is-owner': require('../middlewares/is-owner'),
};

// Default utils
const utils = {
  sanitize: require('../utils/sanitize'),
};

// Default controllers
const controllers = [
  'count',
  'find',
  'findOne',
  'create',
  'delete',
  'update',
  'upload',
  'login',
  'logout',
  'register',
];

const setMiddlewares = fn => {
  if (typeof fn === 'function') return fn();
  else if (typeof fn === 'string') return middlewares[fn];
  else throw Error('Please define mavi middlewares');
};

const createRouter = async ({ base, routes, define, plugins }, options) => {
  const routers = { api: 0, static: 0 };

  if (!routes) throw Error('Please define mavi routes');
  else if (!define) throw Error('Please define mavi define object');

  // Set defined properties
  // set defined middlewares
  if (define.middlewares && typeof define.middlewares === 'object') {
    for (const key in define.middlewares) {
      middlewares[key] = define.middlewares[key];
    }
  }
  // set defined utils
  if (define.utils && typeof define.utils === 'object') {
    for (const key in define.utils) {
      utils[key] = define.utils[key];
    }
  }

  // http methods:
  const methods = [
    'get',
    'post',
    'put',
    'delete',
    'head',
    'connect',
    'trace',
    'patch',
  ];

  // Set required fields for every route
  const $routesConfig = await hydrateRoutes({ routes, define }, options);

  // Generate router from hydrated routes configuration
  for (const path in $routesConfig) {
    const model = path.replace(/\/+/g, '');
    const routes = $routesConfig[path]; // local routes

    // Use model.route.config to generate router
    for (const route of routes) {
      // check if route.method is valid
      if (!methods.includes(route.method.toLowerCase())) {
        return res.status(400).send('Invalid request method');
      }

      // Generate static routes: // https://expressjs.com/en/4x/api.html#express.static
      if ('serve' in route) {
        if (!options.root) {
          throw Error('Please define createRouter options.root');
        }

        // virtual path
        const Base = `${base || ''}/${route.path}`.replace(/\/+/g, '/');

        // physical path
        const path = route.folder
          ? join(options.root, route.folder)
          : route.fullpath;
        const Path = path.replace(/\\+/g, '/');

        // set static folder
        $router.use(
          Base,
          route.middlewares.map(setMiddlewares),
          express.static(Path, route.serve)
        );

        // Counter
        routers.static++;
      }

      // Generate api routes:
      else {
        $router[route.method](
          route.path,
          route.middlewares.map(setMiddlewares),
          async (req, res) => {
            /**
             * @type {{status:number, data:any}} response
             * @description response object from controller
             */
            let response = {};

            // Controller settings
            // ** assign req.config
            // ** req.config can be passed/overwritten from middlewares as well
            // ** but it is not recommended to do so
            // set route configs to the req.config
            req.config =
              typeof req.config === 'object'
                ? { ...route, ...req.config }
                : { ...route };

            // execute utils
            if (route.utils) {
              await Promise.all(
                route.utils.map(function (fn) {
                  if (utils[fn]) {
                    req.body = utils[fn](req.body, route);
                  } else console.error('Utility function not found:', `${model}.utils: [${fn}]`);
                  return req.body;
                })
              );
            }

            // Use controller directly which is defined in routes[x].controller
            if (typeof route.controller === 'function') {
              return route.controller(req, res);
            }

            // Use custom controllers: (comes first because users can overwrite the default controllers)
            else if (route.controller in define.controllers) {
              // execute defined controller
              return define.controllers[route.controller](req, res);
            }

            // Use default controllers
            else if (controllers.find(ctrl => ctrl === route.controller)) {
              // no need to send user id on the client side:
              if (req.owner) {
                if (req.config.model === 'users') {
                  req.params.id = req.owner.id; // for update, delete controllers
                } else {
                  req.body.user = req.owner.id; // for create, update, delete controllers
                }
              }

              const { id, folder } = req.params;
              const { body } = req;
              let args = [];

              // set arguments for default controllers
              switch (route.controller) {
                case 'find':
                case 'count':
                  args = [];
                  break;
                case 'create':
                case 'login':
                case 'logout':
                case 'register':
                  args = [body];
                  break;
                case 'findOne':
                case 'delete':
                  args = [id];
                  break;
                case 'update':
                  args = [id, body];
                  break;
                case 'upload':
                  args = [folder, body, options.root];
                  break;
              }

              // execute default controller
              await req.app
                .controller(req, res)
              [route.controller](...args)
                .then(async res => {
                  // set response
                  response = await res;
                })
                .catch(async err => {
                  if (process.env.NODE_ENV === 'development') {
                    console.log(err);
                  }
                  response = await err;
                });
            } else {
              // controller not found
              response = {
                status: 500,
                data: `Controller "${route.controller}" not found`,
              };
            }

            // prevent unknown status error when some unpredictable error occurs
            if (!response || !response.status) {
              response = {
                status: 500,
                data: 'Unknown error',
              };
            }

            res.status(response.status).send(response.data);
          } // end of async function
        );
      }

      // Counter
      routers.api++;
    }
  }

  // Debug:
  if (options.debug) {
    console.log(
      `\x1b[36m${options.name || 'Router'} is ready: \x1b[32m${routers.api
      } route ${routers.api ? 'is' : 'are'} created \x1b[33m${routers.static} ${routers.static ? 'is' : 'are'
      } serving as a static path\x1b[0m`
    );
  }

  // Router is ready
  return $router;
};

module.exports = createRouter;
