module.exports = {
  port: process.env.NODE_ENV === 'test' ? 3001 : 3000,
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
      controllers: {},
      middlewares: {
        greetings: (req, res, next) => {
          console.log('Hello from middleware!');
          next();
        },
      },
    },
  },
};