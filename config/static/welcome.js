module.exports = [
  {
    path: '/',
    method: 'get',
    serve: {
      // fullpath: 'S:/Projects (my)/lorinto-api/mavi/public/index.html',
      folder: '../public/',
      dotfiles: 'ignore',
      etag: false,
      extensions: ['html', 'htm', 'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'eot', 'ttf', 'woff', 'woff2', 'otf',
      ],
      maxAge: '1d',
    },
  },
];