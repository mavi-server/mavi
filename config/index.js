// Default Server Settings
const { name, version } = require('../package.json')

module.exports = {
  poweredBy: `${name} v${version}`,
  host: 'localhost', // nodejs instance
  port: 3000,
  timer: true,
  cors: require('./cors'),
  database: require('./database'),
  api: require('./api'),
  static: require('./static')
}