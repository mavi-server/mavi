// Default static paths
// You can overwrite this in your own config file
module.exports = [
  {
    base: '/',
    folder: '../public',
    options: {
      dotfiles: 'ignore',
      etag: false,
      extensions: ['html', 'htm', 'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'eot', 'ttf', 'woff', 'woff2', 'otf'],
      maxAge: '1d',
    }
  }
]