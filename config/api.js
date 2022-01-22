const path = require('path')

module.exports = {
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
          references: 'users.id',
        },
        community: {
          type: 'integer',
          references: 'communities.id',
        },
        channel: {
          type: 'integer',
          references: 'channels.id',
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
        updated_at: {
          type: 'timestamp',
          useTz: true,
          precision: 6,
        },
        created_at: {
          type: 'timestamp',
          useTz: true,
          precision: 6,
        },
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
}