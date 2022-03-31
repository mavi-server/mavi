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
  'detect-language': require('../utils/detect-language'),
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

  // Set plugins
  if (plugins && typeof plugins === 'object') {
    // Check plugins configuration
    for (const plugin in plugins) {
      if (!plugins[plugin]) throw Error(`Please define mavi plugins.${plugin}`);
      if (!plugins[plugin].base)
        throw Error(`Please define mavi plugins.${plugin}.base`);
      if (!plugins[plugin].routes)
        throw Error(`Please define mavi routes for ${plugin}`);

      // const $plugin = {
      //   base: plugins[plugin].base || plugin,
      //   routes: { [plugin]: plugins[plugin].routes },
      //   define: plugins[plugin].define || define // uses api define if not defined
      // }

      // Set plugin as Router

      // let slash = $plugin.base.startsWith('/') ? '' : '/'
      // app.use(`${config.api.base}${slash}${$plugin.base}`, timer, createRouter($plugin, { name: plugin, isPlugin: true, debug: true }))
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
        // virtual path
        const Base = `${base || ''}/${route.path}`.replace(/\/+/g, '/');

        // physical path
        const Path = (
          route.fullpath ||
          join(options.__dirname || process.cwd(), route.folder)
        ).replace(/\\+/g, '/');

        // set static folder
        $router.use(
          Base,
          route.middlewares.map(setMiddlewares),
          express.static(Path, route.serve)
        );

        if (options.debug) {
          routers.static++;
          // colorful log:
          // console.log(`\x1b[36mServing  \x1b[32m[${route.method}]${route.path}\x1b[36m path from \x1b[35m${Path}\x1b[0m`,)
        }
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
                : {...route};

            // debug route:
            // console.log(JSON.stringify(route, null, 2));

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
            else if (controllers.includes(route.controller) || route.view) {
              const { id, folder } = req.params;
              const { body } = req;
              let $arguments = [];

              // set $arguments for default controllers
              switch (route.controller) {
                case 'find':
                case 'count':
                case 'findOne':
                  $arguments = [];
                  break;
                case 'create':
                  $arguments = [body];
                  break;
                case 'delete':
                  $arguments = [id];
                  break;
                case 'update':
                  $arguments = [id, body];
                  break;
                case 'upload':
                  $arguments = [folder, body];
                  break;
                case 'login':
                case 'logout':
                case 'register':
                  $arguments = [req, res];
              }

              if (route.view && !route.controller) {
                // execute controller with only view
                await req.app
                  .controller(req, res)
                  .find(false) // false to disable sub-controllers
                  .then(async res => (response = await res))
                  .catch(async err => {
                    if(process.env.NODE_ENV === 'development') {
                      console.log(err);
                    }
                    
                    return (response = await err);
                  });
              } else {
                // execute default controller
                await req.app
                  .controller(req, res)
                  [route.controller](...$arguments)
                  .then(async res => (response = await res))
                  .catch(async err => {
                    if(process.env.NODE_ENV === 'development') {
                      console.log(err);
                    }

                    return (response = await err);
                  });
              }
            } else {
              // controller not found
              response = {
                status: 404,
                data: 'Controller not found',
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

      // Debug:
      if (options.debug) {
        // colorful log:
        // console.log(
        //   `\x1b[36mCreating \x1b[32m[${route.method}] ${route.path}\x1b[36m ${options.name} path\x1b[0m`)
        routers.api++;
      }
    }
  }

  // Debug:
  if (options.debug) {
    console.log(
      `\x1b[36m${options.name || 'Router'} is ready: \x1b[32m${
        routers.api
      } route ${routers.api ? 'is' : 'are'} created \x1b[33m${routers.static} ${
        routers.static ? 'is' : 'are'
      } serving as a static path\x1b[0m`
    );
  }

  // Router is ready
  return $router;
};

module.exports = createRouter;
