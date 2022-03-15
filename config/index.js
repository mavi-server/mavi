// Default Server Settings
const { name, version } = require('../package.json')
const isDev = process.env.NODE_ENV === 'development';
module.exports = {
  poweredBy: `${name} v${version}`,
  host: 'localhost', // nodejs instance
  port: 3000,
  timer: true,
  cors: require('./cors'),
  database: require('./database'),
  api: require('./api'),
  // plugins: ['welcome', 'interface'],
  plugins: {
    welcome: {
      base: '/',
      routes: [
        {
          path: '/',
          method: 'get',
          serve: {
            folder: '../public',
            dotfiles: 'ignore',
            etag: false,
            extensions: ['html', 'htm', 'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'eot', 'ttf', 'woff', 'woff2', 'otf'],
            maxAge: '1d',
          }
        },
        {
          path: '/get',
          method: 'get',
          controller: 'findOne',
          from: 'posts',
        }
      ]
    },
    interface: {
      base: '/interface',
      routes: [
        {
          path: '/interface/save',
          method: 'post',
          controller: 'interface/save',
        },
        {
          path: '/_next',
          method: 'get',
          serve: {
            folder: '../interface/.next/',
            dotfiles: 'ignore',
            etag: false,
            extensions: ['html', 'htm', 'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'eot', 'ttf', 'woff', 'woff2', 'otf'],
            maxAge: '1d',
          }
        },
        {
          path: '/',
          method: 'get',
          serve: {
            folder: '../interface/.next/server/pages/',
            dotfiles: 'ignore',
            etag: false,
            extensions: ['html', 'htm', 'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'eot', 'ttf', 'woff', 'woff2', 'otf'],
            maxAge: '1d',
          }
        },
      ],
    }
  }
}