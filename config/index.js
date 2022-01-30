const path = require('path')
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
  static: [
    {
      base: '/',
      fullpath: path.join(__dirname, '../public').replace(/\\/g, '/'),
      options: {
        dotfiles: 'ignore',
        etag: false,
        extensions: ['html', 'htm', 'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'eot', 'ttf', 'woff', 'woff2', 'otf'],
        maxAge: '1d',
      }
    }
  ]
}

module.exports = config