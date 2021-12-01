// # Default configs
import cors from './cors.js';

export default {
  port: 3000,
  origin: 'http://localhost:3000',
  cors,
  routes: {
    // posts: [
    //   {
    //     path: '/posts',
    //     method: 'get',
    //     controller: 'find',
    //     columns: ['id', 'user', 'title', 'description', 'published', 'timestamps',],
    //     populate: ['bookmark', 'user'],
    //     middleware: ['greetings']
    //   },
    // ]
  },
  define: {
    middleware: {
      // # middleware usage: https://expressjs.com/en/guide/using-middleware.html
      // greetings: (req, res, next) => {
      //   console.log('Hello from middleware!')
      //   next()
      // }
    },
    populate: {
      // user: {
      //   select: 'user',
      //   from: 'users',
      //   type: 'object',
      //   columns: ['id', 'username', 'email', 'avatar', 'fullname', 'created_at']
      // },
      // bookmark: {
      //   select: 'bookmark',
      //   from: 'bookmarks',
      //   type: 'token-reference',
      // },
    },
  },
  database: {
    // # more options: https://knexjs.org/#Installation-client
    // client: 'pg',
    // version: 1,
    // connection: {
    //   database: 'server-generator',
    //   user: 'postgres',
    //   password: 'admin'
    // },
  }
}