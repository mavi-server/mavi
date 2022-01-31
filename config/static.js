// Default static paths
// You can overwrite this in your config
const path = require('path')

module.exports = [
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