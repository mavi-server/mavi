const path = require('path')

module.exports = {
  base: '/api', // api base url
  routes: {},
  static: [], // static paths under api base url
  define: {
    models: {},
    populate: {},
    utils: {},
    middlewares: {},
  },
  plugins: {
    // auth: {},
    // ipx: {},
    // upload: {},
  },
}