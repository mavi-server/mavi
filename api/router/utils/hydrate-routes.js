module.exports = ({ routes, define }, { isPlugin }) => {
  if (!define.models) define.models = {}

  const hydrateRoutes = () => {
    for (const from in routes) {
      // complete required fields for every route
      for (let route of routes[from]) {
        /** set configurations just for entry route (not for sub routes) **/

        // global middleware (order sensitive)
        if (!("middlewares" in route)) route.middlewares = ['interceptor']
        else route.middlewares = ['interceptor', ...route.middlewares]

        // *This is a static route*
        // Serve as a static file:
        if ("serve" in route) {
          // serve options will be used inside of express.static
          // https://expressjs.com/en/4x/api.html#express.static
          if (!route.serve.folder && !route.serve.fullpath) {
            throw Error(`Please define ${from}.serve.folder or ${from}.serve.fullpath`)
          }
          route.method = 'get'
          route.folder = route.serve.folder
          route.fullpath = route.serve.fullpath
          delete route.serve.folder
          delete route.serve.fullpath
        }

        else {
          // global utils (order sensitive)
          if (!("utils" in route)) route.utils = []

          // controller setter
          if ("controller" in route) {
            // if route controller uses req.body eg: create and updates, sanitize as default
            // note: senitize function needs improvement
            // not works with function controllers
            if (typeof route.controller === 'string' && route.controller.match(/create|update/gi)) {
              route.utils.splice(0, 0, 'sanitize')
            }

            // controller options is defined (right now only for uploads):
            if (Array.isArray(route.controller)) {
              const [controller, options] = route.controller

              route.controller = controller
              route.options = options
            }
          }

          // schema columns
          if (define.models[from]) {
            route.schema = Object.keys(define.models[from]).filter(column => column !== 'hash')
          }
          else if (!isPlugin) {
            throw Error('mavi model is not defined!')
          }
        }

        // all the columns are neccessarry for query building
        // ensure all populated routes has columns too!
        // as default, columns came from your model files if they are not private {private: true}
        route = setDefaultColumns(route, from)
      }
    }

    return routes
  }

  const setFragments = column => {
    return define.populate[column] || column
  }

  const setDefaultColumns = async (route, key) => {
    const from = route.from || key
    if (!(from in define.models) && !isPlugin) {
      console.error('Please define a model for the route: ' + from)
      // console.log(route)
    }
    else {
      if (!("exclude" in route)) route.exclude = []
      if (!("columns" in route)) route.columns = []

      // Set columns:
      for (const column in define.models[from]) {
        // Select all by default and exclude the "hash" & "private" fields
        if (column == "hash" || define.models[from][column].private) continue

        // Don't include the excluded columns
        if (!route.exclude.includes(column)) route.columns.push(column)
      }

      // count type doesn't needs columns
      if (route.type && route.type === 'count') route.columns = []

      // if populate is defined, set default columns for it
      if ("populate" in route) {
        // convert into array if populate is an object
        if (!Array.isArray(route.populate)) route.populate = [route.populate]

        // combine sub route fragments with populate names in array
        route.populate = await Promise.all(route.populate.map(setFragments))

        // set default columns
        route.populate = await Promise.all(route.populate.map(setDefaultColumns))
      }
    }

    return route
  }

  return hydrateRoutes()
}
