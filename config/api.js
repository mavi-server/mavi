module.exports = {
  base: '/api', // api base url
  routes: {}, // api routes, can be static or dynamic.
  define: { // define elements for api
    models: {}, // database tables
    populate: {}, // deep query objects
    utils: {}, // api utils, small functions like trimming, sanitizing etc.
    middlewares: {}, // express middlewares
    controllers: {}, // extend controllers
  },
};