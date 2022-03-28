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
    },
  },
  api: {
    base: '/',
    routes: require('./routes'),
    define: {
      models: require('./models'), // if you reference to `models/index.js`, you can take advantage of database-state tracking
      populate: require('./routes/populate'),
      // middlewares: {
      //   greetings: (req, res, next) => {
      //     console.log('Hello from middleware!');
      //     next();
      //   },
      // },
    },
  },
};