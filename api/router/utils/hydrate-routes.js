import populate from '../config-sub'
import models from '../../../database/models'

export default (routes) => {
  Promise.all(Object.keys(routes).map(async function (from) {
    await Promise.all(routes[from].map(async route => {
      /** configurations just for entry route (not for sub routes) **/

      // global middleware (order sensitive)
      if (!route.middlewares) route.middlewares = []
      route.middlewares = ['interceptor', ...route.middlewares]

      // global utils (order sensitive)
      if (!route.utils) route.utils = []
      // if route controller uses req.body, sanitize as default
      if (route.controller.match(/create|update/gi)) route.utils.splice(0, 0, 'sanitize')

      // schema columns
      route.schema = Object.keys(models[from])

      // all columns are neccessarry for query building
      // ensure all populated routes has columns too!
      route = await setDefaultColumns(route, from)

      return route
    }))

    return from
  }))

  // console.log(JSON.stringify(routes))
  return routes
}

const setFragments = column => {
  return populate[column] || column
}

const setDefaultColumns = async (route, key) => {
  const from = route.from || key

  // set columns if doesn't exists
  if (!route.columns && models[from]) {
    // automatically get columns
    // default: select all, exclude private fields
    route.columns = Object.keys(models[from]).filter((col) => !models[from][col].private)
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
  else if (!models[from]) console.error('please define a model first!')

  // cont type doesn't needs columns
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