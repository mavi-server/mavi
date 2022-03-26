module.exports = ({ routes, define }, options) => {
  if (!define.models) define.models = {};

  const hydrateRoutes = () => {
    for (const path in routes) {
      if (!routes[path]) throw Error(`Please define mavi routes for ${path}`);
      if (!Array.isArray(routes[path])) throw Error(`Please define mavi routes for ${path} as array`);

      // complete required fields for every route
      for (let route of routes[path]) {
        /** set configurations just for entry route (not for sub routes) **/

        // set default model as `parent path name` if not defined
        if (!route.model) {
          // auth controllers needs 'users' model
          if (['login', 'logout', 'register'].includes(route.controller)) {
            route.model = 'users';
          }
          // use parent path name as model
          else {
            route.model = path.replace(/\/+/g, '');
          }
        }

        if (!route.path) throw Error(`Please define mavi routes['${path}'][x].path`);

        // set full path
        route.path = `${path}/${route.path}`.replace(/\/+/g, '/');

        // global middleware (order sensitive)
        if (!("middlewares" in route)) route.middlewares = ['interceptor'];
        else route.middlewares = ['interceptor', ...route.middlewares];

        // *If this is a static route*
        if ("serve" in route) {
          // Serves as a static file
          // serve options will be used inside of express.static
          // https://expressjs.com/en/4x/api.html#express.static

          if (!route.serve) throw Error(`Please define mavi routes['${path}'].serve`);
          if (!route.serve.folder && !route.serve.fullpath) {
            throw Error(`Please define routes['${path}'].serve.folder or routes['${path}'].serve.fullpath`);
          }

          if (!route.method) {
            // set default method to get
            route.method = 'get';
          }
          if (!route.folder && route.serve.folder) {
            route.folder = route.serve.folder.replace(/\/+/g, '/');
            delete route.serve.folder;
          }
          if (!route.fullpath && route.serve.fullpath) {
            route.fullpath = route.serve.fullpath.replace(/\/+/g, '/');
            delete route.serve.fullpath;
          }
        }

        // *If this is a dynamic route*
        else {
          if (!route.method) throw Error(`Please define mavi routes['${path}'].method`);

          // global utils (order sensitive)
          if (!("utils" in route)) route.utils = [];

          // controller setter
          if ("controller" in route) {
            // if route controller uses req.body eg: create and updates, sanitize as default
            // note: senitize function needs improvement
            // not works with function controllers
            if (typeof route.controller === 'string' && route.controller.match(/create|update/gi)) {
              route.utils.splice(0, 0, 'sanitize');
            }

            // controller options is defined (right now only for uploads):
            if (Array.isArray(route.controller)) {
              const [controller, options] = route.controller;

              route.controller = controller;
              route.options = options;
            }
          }

          // set schema columns:
          if (define.models[route.model]) {
            route.schema = Object.keys(define.models[route.model]).filter(column => column !== 'hash');
          }
          else if (route.controller) {
            throw Error(`Please define mavi model for '${route.model}'`);
          }
        }

        // all the columns are neccessarry for query building
        // ensure all populated routes has columns too!
        // as default, columns came from your model files if they are not private {private: true}
        route = setDefaultColumns(route);
      }
    }

    return routes;
  };

  const setFragments = column => {
    return define.populate[column] || column;
  };


  const setDefaultColumns = async route => {
    const model = route.model || route.from; // from is used in sub routes
    const controllers = ['count', 'find', 'findOne', 'update', 'create', 'delete', 'upload'];

    // if route uses one of these controllers, then it should have a model
    if (route.controller && !define.models[model] && controllers.includes(route.controller)) {
      throw new Error(`Please define a model for the '${model}' which is used in '${route.path}' path`);
    }
    else {
      if (!("exclude" in route)) route.exclude = [];
      if (!("columns" in route)) route.columns = [];

      // Set columns:
      for (const column in define.models[model]) {
        // Select all by default and exclude the "hash" & "private" fields
        if (column == "hash" || define.models[model][column].private) continue;

        // Don't include the excluded columns
        if (!route.exclude.includes(column)) route.columns.push(column);
      }

      // count type doesn't needs columns
      if (route.type && route.type === 'count') route.columns = [];

      // if populate is defined, set default columns for it
      if ("populate" in route) {
        // convert into array if populate is an object
        if (!Array.isArray(route.populate)) route.populate = [route.populate];

        // combine sub route fragments with populate names in array
        route.populate = await Promise.all(route.populate.map(setFragments));

        // set default columns
        route.populate = await Promise.all(route.populate.map(setDefaultColumns));
      }
    }

    return route;
  };

  return hydrateRoutes();
};
