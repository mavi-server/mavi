const Package = require('../package.json')

// # Server Settings
const config = {
  poweredBy: `${Package.name} v${Package.version}`,
  host: 'localhost', // nodejs instance
  port: 3000,
  cors: {
    methods: ['POST', 'GET', 'PUT', 'DELETE'],
    allowedHeaders: ['x-access-token', 'x-refresh-token', 'token'],
  },
  database: require('./database'),
  api: require('./api'),
}

module.exports = config