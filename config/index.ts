const path = require('path')
const pkg = require('../package.json')
import BlueServer from '../types/blue-server'

// # Server Settings
const config: BlueServer.Config = {
  poweredBy: `${pkg.name} v${pkg.version}`,
  host: 'localhost', // nodejs instance
  port: 3000,
  cors: {
    methods: ['POST', 'GET', 'PUT', 'DELETE'],
    allowedHeaders: ['x-access-token', 'x-refresh-token', 'token'],
  },
  // https://knexjs.org/#Installation-client
  database: require('../database/config'),
  api: {
    base: '/api', // api base url
    routes: {
      posts: [
        {
          path: '/posts',
          method: 'get',
          controller: 'find',
          columns: ['id', 'user', 'title', 'description', 'published', 'timestamps',],
          populate: ['bookmark', 'user'],
          middlewares: [],
        },
      ],
    },
    static: [
      {
        base: '/',
        fullpath: path.join(__dirname, '../public'),
        options: {
          dotfiles: 'ignore',
          etag: false,
          extensions: ['html', 'htm', 'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'ico', 'svg', 'eot', 'ttf', 'woff', 'woff2', 'otf'],
          maxAge: '1d',
        }
      }
    ],
    define: {
      models: {
        posts: {
          id: {
            type: 'increments',
            constraints: ['primary'],
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

module.exports = config