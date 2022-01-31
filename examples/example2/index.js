module.exports = {
  port: 3001,
  poweredBy: 'Example Server',
  database: {
    development: {
      client: 'pg',
      connection: {
        database: 'test',
        user: 'postgres',
        password: 'admin',
      },
    },
    production: {
      client: 'pg',
      connection: {
        database: 'test',
        user: 'postgres',
        password: 'admin',
      },
    }
  },
  api: {
    routes: require('./routes'),
    define: {
      models: require('./models'), // if you reference to `models/index.js`, you can take advantage of database-state tracking & apply-models
      populate: require('./routes/populate'),
      middlewares: {
        greetings: (req, res, next) => {
          console.log('Hello from middleware!')
          next()
        }
      },
    },
    plugins: {
      // auth: true // you need `users` model for this with at least: `username`, `email`, `password` columns
      // if you use auth, you can use `is-owner`, `authorization` middlewares in `config.api.routes`
      // and you will have additional [post]/login, [post]/logout, [post]/register routes
    },
  },
}