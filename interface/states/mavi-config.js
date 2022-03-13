export default {
  host: 'localhost',
  port: 3001,
  poweredBy: 'Mavi',
  timer: true,
  cors: {
    origin: ['*'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['x-access-token', 'x-refresh-token', 'token', 'content-type', 'accept'],
  },
  static: {
    base: '/',
    folder: '../public',
    options: {
      dotfiles: 'ignore',
      etag: false,
      extensions: [
        'html',
        'htm',
        'css',
        'js',
        'png',
        'jpg',
        'jpeg',
        'gif',
        'ico',
        'svg',
        'eot',
        'ttf',
        'woff',
        'woff2',
        'otf',
      ],
      maxAge: '1d',
    },
  },
  database: {
    development: {
      client: 'pg',
      connection: {
        database: 'process.env.DEV_DB_NAME',
        user: 'process.env.DEV_DB_USER',
        password: 'process.env.DEV_DB_PASS'
      },
      pool: {
        min: 2,
        max: 10
      },
      debug: false,
    },
    production: {
      client: 'pg',
      connection: {
        database: process.env.PRO_DB_NAME,
        user: process.env.PRO_DB_USER,
        password: process.env.PRO_DB_PASS
      },
      pool: {
        min: 2,
        max: 10
      },
      debug: false,
    },
  }
}