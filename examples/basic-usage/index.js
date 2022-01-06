const server = require('./blue-server/api/index');
server({
  port: 3000,
  origin:'http://localhost:3000',
  // https://www.npmjs.com/package/cors
  cors: {
    methods: ['POST', 'GET', 'DELETE', 'PUT'],
    allowedHeaders: ['x-access-token', 'x-refresh-token', 'token'],
    // exposedHeaders: ['x-access-token','x-refresh-token','token']
  },
  // https://knexjs.org/#Installation-client
  database: {
    development: {
      client: 'pg',
      version: 0.2,
      connection: {
        database: process.env.DEV_DB_NAME,
        user: process.env.DEV_DB_USER,
        password: process.env.DEV_DB_PASS,
      },
      pool: {
        min: 2,
        max: 10
      },
      migrations: {
        directory: './migrations',
        // schemaName: 'public',
        tableName: 'knex_migrations',
        stub: 'migration.stub.js',
        // disableMigrationsListValidation: true,
      },
      seeds: {
        directory: './migrations',
      }
    },
  
    production: {
      client: 'pg',
      version: 0.2,
      connection: {
        database: process.env.PRO_DB_NAME,
        user: process.env.PRO_DB_USER,
        password: process.env.PRO_DB_PASS
      },
      pool: {
        min: 2,
        max: 10
      },
      migrations: {
        directory: './migrations',
        // schemaName: 'public',
        tableName: 'knex_migrations',
        stub: 'migration.stub.js',
        // disableMigrationsListValidation: true,
      },
      seeds: {
        directory: './migrations',
      }
    }
  },
  api: {
    routes: require('./routes'),
    define: {
      models: require('./models'),
      populate: require('./routes/populate'),
      views: require('./views'),
      utils: {},
      // https://expressjs.com/en/guide/using-middleware.html
      middlewares: {
        greetings: (req, res, next) => {
          console.log('Hello from middleware!')
          next()
        }
      },
    },
    // Not ready yet
    // plugins: {
    //   auth: {},
    //   ipx: {},
    //   upload: {},
    // },
  },
})