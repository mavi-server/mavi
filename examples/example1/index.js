const Package = require('./package.json')
module.exports = {
  poweredBy: 'Mavi v'.concat(Package.version),
  host: 'localhost',
  port: 3001,
  // Check the cors module for more options: https://www.npmjs.com/package/cors
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['POST', 'GET', 'DELETE', 'PUT'],
    allowedHeaders: ['x-access-token', 'x-refresh-token', 'token', 'content-type', 'accept'],
  },
  // See more about this database connection: https://knexjs.org/#Installation-client
  database: {
    development: {
      client: 'pg', // I have not tested for other RDBMSs yet. PostgreSQL works fine. (0.5.4)
      connection: {
        database: 'test',
        user: 'postgres',
        password: 'admin',
      },
      pool: {
        min: 2,
        max: 10,
      },
      logs: true, // prints knex queries to console
    },
    production: {
      client: 'pg',
      connection: {
        database: 'test',
        user: 'postgres',
        password: 'admin',
      },
      pool: {
        min: 2,
        max: 10,
      },
    },
  },
  api: {
    base: '/api',
    // Api routes
    routes: {
      // [table name]: Routes[]
      posts: [
        {
          path: '/posts',
          method: 'get',
          controller: 'find',
          exclude: ['content'],
          populate: ['user'],
        },
        {
          path: '/posts-from-view',
          method: 'get',
          view: 'example_view' // can be combined with the controller as well
        },
        {
          path: '/posts/count',
          method: 'get',
          controller: 'count',
        },
        {
          path: '/posts/:id',
          method: 'get',
          controller: 'findOne',
          populate: ['user', 'tags'],
        },
        {
          path: '/posts/:id',
          method: 'put',
          controller: 'update',
          middlewares: ['is-owner'],
          populate: ['user', 'tags'],
        },
        {
          path: '/posts/:id',
          method: 'delete',
          controller: 'delete',
          middlewares: ['is-owner'],
        },
        {
          path: '/posts',
          method: 'post',
          controller: 'create',
          middlewares: ['authorization'],
          utils: ['detect-language'],
          populate: ['user'],
        },
      ],
    },
    define: {
      models: {
        // an important note here: all the `hash` properties are automatically assigned if you put your models in the `models` folder and export with their name in index file
        // example models/index.js:
        // module.exports = {
        //   users: require('./users'),
        //   posts: require('./posts'),
        // }
        // but if you use them here, you should assign `hash` properties manually
        // after that, if you change table/column names or add new tables/columns, or change your column properties
        // mavi will update your database automatically.
        // be careful if you drop/rename your hash property, dependent entity will be deleted entirely from your database (0.5.4 and previous versions)
        users: {
          id: { type: 'increments', constraints: ['primary'], hash: 'WzE2NDMyMTk4NjY1MDRddXNlcnMuaWQ' },
          username: { type: 'string', constraints: ['unique'], maxlength: 18, hash: 'WzE2NDMyMTk4Nzc0MjRddXNlcnMudXNlcm5hbWU' },
          email: { type: 'string', constraints: ['unique'], maxlength: 100, hash: 'WzE2NDMyMjA4Nzg4MDdddXNlcnMuZW1haWw' },
          fullname: { type: 'string', maxlength: 100, hash: 'WzE2NDMyMjE0OTg0NzFdbXl1c2Vycy5mdWxsbmFtZQ' },
          password: { type: 'string', private: true, hash: 'WzE2NDMzOTk3MzA4MjJddXNlcnMucGFzc3dvcmQ' },
          bio: { type: 'string', maxlength: 255, hash: 'dXNlcnMuYmlv' },
          blocked: { type: 'boolean', default: false, hash: 'dXNlcnMuYmxvY2tlZA' },
          avatar: { type: 'string', hash: 'dXNlcnMuYXZhdGFy' },
          token: { type: 'text', private: true, hash: 'dXNlcnMudG9rZW4' },
          refresh: { type: 'text', private: true, hash: 'dXNlcnMucmVmcmVzaA' },
          updated_at: { type: 'timestamp', useTz: true, precision: 6, hash: 'dXNlcnMudXBkYXRlZF9hdA' },
          created_at: {
            type: 'timestamp', useTz: true, precision: 6, hash: 'dXNlcnMuY3JlYXRlZF9hdA'
          },
          hash: 'dXNlcnM'
        },
        tags: {
          id: {
            type: 'increments',
            constraints: ['primary'],
            hash: 'dGFncy5pZA'
          },
          name: {
            type: 'string',
            constraints: ['notNullable', 'unique'],
            maxlength: 16,
            hash: 'dGFncy5uYW1l'
          },
          hash: 'dGFncw'
        },
        posts: {
          id: {
            type: 'increments',
            constraints: ['primary'],
            hash: 'cG9zdHMuaWQ'
          },
          user: {
            type: 'integer',
            constraints: ['notNullable'],
            references: 'users.id', // this is the `id` property of the `users` model
            onDelete: 'cascade', // if you delete a user, all his posts will be deleted
            onUpdate: 'cascade', // if you update a user, all his posts will be updated
            comment: 'author',
            hash: 'cG9zdHMudXNlcg'
          },
          title: {
            type: 'string',
            maxlength: 100,
            hash: 'cG9zdHMudGl0bGU'
          },
          published: {
            type: 'boolean',
            defaultTo: true,
            hash: 'cG9zdHMucHVibGlzaGVk'
          },
          content: {
            type: 'text',
            constraints: ['notNullable'],
            hash: 'cG9zdHMuY29udGVudA'
          },
          description: {
            type: 'string',
            maxlength: 300,
            hash: 'cG9zdHMuZGVzY3JpcHRpb24'
          },
          tags: {
            type: 'string',
            hash: 'cG9zdHMudGFncw'
          },
          language: {
            type: 'string',
            constraints: ['notNullable'],
            hash: 'cG9zdHMubGFuZ3VhZ2U'
          },
          // if type is a timestamp and the column name includes `update`, date will be updated automatically on every update
          updated_at: {
            type: 'timestamp',
            useTz: true,
            precision: 6,
            hash: 'cG9zdHMudXBkYXRlZF9hdA'
          },
          // if type is a timestamp and the column name includes `create`, date will be created automatically on creation
          created_at: {
            type: 'timestamp',
            useTz: true,
            precision: 6,
            hash: 'cG9zdHMuY3JlYXRlZF9hdA'
          },
          hash: 'WzE2NDM1Nzg3NDYwNzBdcG9zdHM'
        },
      },
      // Seeds are automatically inserted into your database
      seeds: {
        posts: [
          {
            "id": 1,
            "user": 1,
            "title": "cursus et velit id",
            "description": "Integer cursus felis vitae tellus faucibus. Nam metus urna, ornare a diam quis, consectetur euismod ante. Nullam augue lorem, porta dictum facilisis ut, viverra vitae nibh",
            "published": true,
            "tags": "[1,2]",
            "content": "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus.</p>",
            "language": "turkish"
          },
          {
            "id": 2,
            "user": 2,
            "title": "cursus et velit id",
            "description": "Integer cursus felis vitae tellus faucibus. Nam metus urna, ornare a diam quis, consectetur euismod ante. Nullam augue lorem, porta dictum facilisis ut, viverra vitae nibh",
            "published": true,
            "tags": "[3]",
            "content": "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus.</p>",
            "language": "english"
          },
        ],
        users: [
          {
            id: 1,
            fullname: 'M. Emre Yalçın',
            username: 'emreyalcin',
            email: 'emrreyalcin@gmail.com',
            password: '$2a$10$QSQCbjqfTZwCgJkVkof1GOj6n/mckq2H.Abys48wQSak.rbWhBlwi', // 123456 if you resolve with the given ACCESS_TOKEN_SECRET defined in .env
            blocked: false,
            avatar: '/uploads/profile-photos/1.jpg'
          },
          {
            id: 2,
            fullname: 'Jane Garner',
            username: 'janieee',
            email: 'jane@gmail.com',
            password: '$2a$10$QSQCbjqfTZwCgJkVkof1GOj6n/mckq2H.Abys48wQSak.rbWhBlwi',
            blocked: false,
            avatar: '/uploads/profile-photos/40.jpg'
          },
          {
            id: 3,
            fullname: 'Angela White',
            username: 'angela',
            email: 'angela@gmail.com',
            password: '$2a$10$QSQCbjqfTZwCgJkVkof1GOj6n/mckq2H.Abys48wQSak.rbWhBlwi',
            blocked: false,
            avatar: '/uploads/profile-photos/44.jpg'
          },
        ],
        tags: [
          {
            name: 'world literacy',
          },
          {
            name: 'story',
          },
          {
            name: 'novel',
          },
        ]
      },
      // Populate configs are used in routes
      // There are different types of populates but none of them are standard. Will explain when they are ready.
      populate: {
        user: {
          select: 'user',
          from: 'users',
          type: 'object',
          columns: ['id', 'username', 'email', 'avatar', 'fullname', 'created_at'],
        },
        tags: {
          select: 'tags',
          from: 'tags',
          type: 'array-reference',
        },
      },
      // Middlewares are used in routes
      middlewares: {
        greetings: function (req, res, next) {
          console.log('Hello from middleware!')
          next()
        },
      },
      // Views are used in routes to extend controller methods.
      // Views will give the ability to make custom queries and can be combined with controllers.
      // Views are not intended to replace the actual views of the RDBMS (for now)
      views: {
        example_view: (knex, params) => {
          // refer to this doc for the usage of knex: https://knexjs.org/
          // you can also return a raw sql string as well
          return knex.select('*').from('users').where('id', params.id)
        }
      }
    },
    // Static path under api
    static: [
      {
        base: '/static', // virtual path
        folder: 'public', // pysical path (also can be fullpath)
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
          setHeaders: function (res, path, stat) {
            res.set('x-timestamp', Date.now())
          },
        },
      },
    ],
  },
}