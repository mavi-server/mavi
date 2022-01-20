module.exports = ({ routes, define }) => {
  if (!define.models) define.models = {}

  const hydrateRoutes = () => {
    for (const from in routes) {
      for (let route of routes[from]) {
        let isPlugin = false
        /** set configurations just for entry route (not for sub routes) **/

        // global middleware (order sensitive)
        if (!route.middlewares) route.middlewares = []
        route.middlewares = ['interceptor', ...route.middlewares]

        // global utils (order sensitive)
        if (!route.utils) route.utils = []

        // some controllers might be a function (plugin controllers)
        if (typeof route.controller === 'function') isPlugin = true // treated as a plugin

        // if route controller uses req.body, sanitize as default
        if (!isPlugin && route.controller.match(/create|update/gi)) route.utils.splice(0, 0, 'sanitize')


        // schema columns
        if (define.models[from]) route.schema = Object.keys(define.models[from])
        else if (!isPlugin) throw new Error('the blue-server model is not defined!')

        // all the columns are neccessarry for query building
        // ensure all populated routes has columns too!
        // as default, columns came from your model files if they are not private {private: true}
        route = setDefaultColumns(route, from)
      }
    }

    // console.log(JSON.stringify(routes))
    return routes
  }

  const setFragments = column => {
    return define.populate[column] || column
  }

  const setDefaultColumns = async (route, key) => {
    const from = route.from || key

    // set columns if doesn't exists
    if (!route.columns && define.models[from]) {
      // automatically get the columns
      // default: select all, exclude private fields
      route.columns = Object.keys(define.models[from]).filter((col) => !define.models[from][col].private)
    }

    if (route.columns) {
      route.columns.forEach((col, i) => {
        // exclude columns
        if (route.exclude && route.exclude.includes(col)) {
          route.columns.splice(i, 1)
        }
        else if (!route.exclude) {
          route.exclude = []
        }
      })

      // set timestamps
      if (route.columns.includes('timestamps')) {
        const i = route.columns.findIndex(c => c == 'timestamps')
        route.columns.splice(i, 1)
        route.columns.push('created_at', 'updated_at')
      }
    }
    // else if (!define.models[from]) console.error('Please define a model for your populated tables')

    // count type doesn't needs columns
    if (route.type && route.type === 'count') route.columns = []


    // if populate is defined, set default columns for it
    if (route.populate) {
      // convert into array if populate is an object
      if (!Array.isArray(route.populate)) route.populate = [route.populate]

      // combine sub route fragments with populate names in array
      route.populate = await Promise.all(route.populate.map(setFragments))

      // set default columns
      route.populate = await Promise.all(route.populate.map(setDefaultColumns))
    }

    return route
  }

  return hydrateRoutes()
}
