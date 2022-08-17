// Default Server Settings
const { name, version } = require('../package.json');
const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  poweredBy: `${name} v${version}`,
  host: 'localhost', // nodejs instance
  port: 3000,
  cors: require('./cors'),
  database: require('./database'),
  api: require('./api'),
  page: isDev ? 'admin' : 'welcome',
  timer: true,
};
