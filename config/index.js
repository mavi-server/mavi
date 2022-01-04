// # Server Settings

module.exports = {
  port: 3000,
  origin: 'http://localhost:3000',
  // https://www.npmjs.com/package/cors
  cors: {
    methods: ['POST', 'GET', 'DELETE', 'PUT'],
    allowedHeaders: ['x-access-token', 'x-refresh-token', 'token'],
    // exposedHeaders: ['x-access-token','x-refresh-token','token']
  },
  // https://knexjs.org/#Installation-client
  database: require('../database/config'),
  api: {
    routes: {
      posts: [
        {
          path: '/posts',
          method: 'get',
          controller: 'find',
          columns: ['id', 'user', 'title', 'description', 'published', 'timestamps',],
          populate: ['bookmark', 'user'],
          middleware: ['greetings']
        },
      ]
    },
    define: {
      models: {
        posts: {
          id: {
            type: 'increments',
            constraints: ['primary']
          },
          user: {
            type: 'integer',
            constraints: ['notNullable'],
            comment: 'author',
            references: 'id',
            inTable: 'users'
          },
          community: {
            type: 'integer',
            references: 'id',
            inTable: 'communities'
          },
          channel: {
            type: 'integer',
            references: 'id',
            inTable: 'channels',
            defaultTo: 1,
          },
          title: {
            type: 'string',
            maxlength: 100,
          },
          published: {
            type: 'boolean',
            defaultTo: true
          },
          content: {
            type: 'text',
            constraints: ['notNullable']
          },
          description: {
            type: 'string',
            maxlength: 300,
          },
          thumbnail: {
            type: 'integer',
            references: 'uploads.id',
          },
          tags: {
            type: 'string',
          },
          language: {
            type: 'string',
            constraints: ['notNullable']
          },
          timestamps: [true, true]
        },
      },
      populate: {
        user: {
          select: 'user',
          from: 'users',
          type: 'object',
          columns: ['id', 'username', 'email', 'avatar', 'fullname', 'created_at']
        },
        bookmark: {
          select: 'bookmark',
          from: 'bookmarks',
          type: 'token-reference',
        },
      },
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
}