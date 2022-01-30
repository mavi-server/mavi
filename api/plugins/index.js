// right now, only two plugins supported
module.exports = {
  auth: {
    routes: {
      auth: require('./auth/index'),
    },
    define: {}
  },
  ipx: require('./ipx/index'), // not tested
}