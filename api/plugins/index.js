module.exports = {
  auth: {
    routes: {
      auth: require('./auth/index'),
    },
    define: {}
  },
  ipx: require('./ipx/index'), // bu niye çalışmadı?
}