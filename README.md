![mavi-server](https://raw.githubusercontent.com/m-emre-yalcin/mavi/main/public/brand.svg)

Create an abstracted and extendible server from one JSON file!

This module aims to lift repetitive works that you have made every time building a server from scratch.

`Important`: The package is still in development. I do not recommend to use in production. I have plans to make this module more user friendly and I am open to collaborations. You can [email](mailto:emrreyalcin@gmail.com) me or open an issue if you decided to contribute.

---

There are two ways to use this module.

## NPM module usage

`npm i mavi`

With the npm usage, you just have to define your server config inside of the `./index.js` and use `mavi start` script then you ready to go!

## Sub module usage

Clone this repository `https://github.com/m-emre-yalcin/mavi`
then `npm install` all the dependencies and `npm run build` to create the `dist` folder. Then in your `index.js` file, you can create the server with `require('./dist/index').createServer(serverConfig)` function. Then start your app with `nodemon index.js`.

---

## Example

The file below will create the entire server. You need to connect your database first then you can add some routes.

_Don't forget, the columns you choose on one route should be defined in your database too._

Define more populate options and middlewares to be able to use them in your routes.

An example server configuration file:

```js
const Package = require('./package.json')
module.exports = {
  poweredBy: 'Mavi v'.concat(Package.version),
  host: 'localhost',
  port: 3001,
  cors: { // https://www.npmjs.com/package/cors#configuring-cors-w-dynamic-origin
    origin: [process.env.CLIENT_URL || 'http://localhost:3000', process.env.SERVER_URL || 'http://localhost:3001'],
    methods: ['POST', 'GET', 'DELETE', 'PUT'],
    allowedHeaders: ['x-access-token', 'x-refresh-token', 'token', 'content-type', 'accept'],
  },
  database: {
    development: {
      client: 'pg',
      connection: {
        database: process.env.DEV_DB_NAME,
        user: process.env.DEV_DB_USER,
        password: process.env.DEV_DB_PASS,
      },
      pool: {
        min: 2,
        max: 10,
      },
      debug: true, // prints knex queries to console
    },
    production: {
      client: 'pg',
      connection: {
        database: process.env.PRO_DB_NAME,
        user: process.env.PRO_DB_USER,
        password: process.env.PRO_DB_PASS,
      },
      pool: {
        min: 2,
        max: 10,
      },
    },
  },
  api: {
    base: '/api',
    routes: {
      posts: [
        {
          path: '/posts',
          method: 'get',
          controller: 'find',
          exclude: ['content'],
          populate: ['bookmark', 'user', 'community', 'thumbnail', 'responseCount'],
          middlewares: ['greetings'],
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
          populate: ['bookmark', 'user', 'community', 'thumbnail', 'responseCount', 'tags'],
        },
        {
          path: '/posts/:id',
          method: 'put',
          controller: 'update',
          middlewares: ['is-owner'],
          populate: ['bookmark', 'user', 'community', 'thumbnail', 'responseCount', 'tags'],
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
          populate: ['bookmark', 'user', 'community', 'thumbnail'],
        },
      ],
      uploads: [
        {
          path: '/uploads',
          method: 'get',
          serve: {
            folder: 'uploads',
            dotfiles: 'ignore',
            etag: false,
            extentsions: ['png', 'jpg', 'jpeg', 'gif', 'ico', 'svg'],
            maxAge: '1d',
          },
        },
        {
          path: '/uploads/list',
          method: 'get',
          controller: 'find',
        },
        {
          path: '/uploads/:id',
          method: 'get',
          controller: 'findOne',
          middlewares: ['is-owner'],
        },
        {
          path: '/uploads/:folder',
          method: 'post',
          controller: [
            'upload',
            {
              accept: 'image',
              folders: ['avatars', 'thumnail'],
              maxFileSize: 5242880, // bytes = 5mb
            },
          ],
          middlewares: ['authorization'],
        },
        {
          path: '/uploads/:id',
          method: 'put',
          controller: 'update',
          middlewares: ['is-owner'],
        },
      ],
    },
    static: [
      {
        base: '/static',
        folder: 'public',
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
    define: {
      models: {
        posts: {
          id: {
            type: 'increments',
            constraints: ['primary'],
            hash: 'cG9zdHMuaWQ',
          },
          user: {
            type: 'integer',
            constraints: ['notNullable'],
            comment: 'author',
            references: 'users.id',
            hash: 'cG9zdHMudXNlcg',
          },
          community: {
            type: 'integer',
            references: 'communities.id',
            hash: 'cG9zdHMuY29tbXVuaXR5',
          },
          title: {
            type: 'string',
            maxlength: 100,
            hash: 'cG9zdHMudGl0bGU',
          },
          published: {
            type: 'boolean',
            defaultTo: true,
            hash: 'cG9zdHMucHVibGlzaGVk',
          },
          content: {
            type: 'text',
            constraints: ['notNullable'],
            hash: 'cG9zdHMuY29udGVudA',
          },
          description: {
            type: 'string',
            maxlength: 300,
            hash: 'cG9zdHMuZGVzY3JpcHRpb24',
          },
          thumbnail: {
            type: 'integer',
            references: 'uploads.id',
            hash: 'cG9zdHMudGh1bWJuYWls',
          },
          tags: {
            type: 'string',
            hash: 'cG9zdHMudGFncw',
          },
          language: {
            type: 'string',
            constraints: ['notNullable'],
            hash: 'cG9zdHMubGFuZ3VhZ2U',
          },
          updated_at: {
            // if type is a timestamp and the column name includes `update`, date will be updated automatically on every update
            type: 'timestamp',
            useTz: true,
            precision: 6,
            hash: 'cG9zdHMudXBkYXRlZF9hdA',
          },
          created_at: {
            // if type is a timestamp and the column name includes `create`, date will be created automatically on creation
            type: 'timestamp',
            useTz: true,
            precision: 6,
            hash: 'cG9zdHMuY3JlYXRlZF9hdA',
          },
          hash: 'WzE2NDM1Nzg3NDYwNzBdcG9zdHM',
        },
        uploads: {
          id: {
            type: 'increments',
            constraints: ['primary'],
            hash: 'dXBsb2Fkcy5pZA',
          },
          url: {
            type: 'text',
            constraints: ['notNullable'],
            hash: 'dXBsb2Fkcy51cmw',
          },
          alt: { type: 'text', hash: 'dXBsb2Fkcy5hbHQ' },
          user: {
            type: 'integer',
            comment: 'Image owner',
            references: 'users.id',
            hash: 'dXBsb2Fkcy51c2Vy',
          },
          updated_at: {
            type: 'timestamp',
            useTz: true,
            precision: 6,
            hash: 'dXBsb2Fkcy51cGRhdGVkX2F0',
          },
          created_at: {
            type: 'timestamp',
            useTz: true,
            precision: 6,
            hash: 'dXBsb2Fkcy5jcmVhdGVkX2F0',
          },
          hash: 'dXBsb2Fkcw',
        },
      },
      seeds: {
        posts: [
          {
            id: 1,
            user: 1,
            community: 1,
            title: 'Post 1',
            published: true,
            content: '<p>This is the first post</p>',
            description: 'This is the first post',
            thumbnail: 1,
            tags: '[1,2]',
            language: 'en',
            updated_at: '2022-01-01 00:00:00',
            created_at: '2022-01-01 00:00:00',
          },
        ],
      },
      populate: {
        user: {
          select: 'user',
          from: 'users',
          type: 'object',
          columns: ['id', 'username', 'email', 'avatar', 'fullname', 'created_at'],
        },
        community: {
          select: 'community',
          from: 'communities',
          type: 'object',
          exclude: ['updated_at'],
          populate: ['icon'],
        },
        thumbnail: {
          select: 'thumbnail',
          from: 'uploads',
          type: 'object',
        },
        icon: {
          select: 'icon',
          from: 'uploads',
          type: 'object',
        },
        replyTo: {
          select: 'replyTo',
          from: 'threads',
          type: 'object',
          exclude: ['content', 'timestamps'],
        },
        responseTo: {
          select: 'responseTo',
          from: 'posts',
          type: 'object',
          columns: ['id', 'title', 'community', 'description'],
          populate: ['community'],
        },
        tags: {
          select: 'tags',
          from: 'tags',
          type: 'array-reference',
        },
        responseCount: {
          select: 'responseCount',
          on: 'responseTo',
          from: 'threads',
          type: 'count',
        },
        replyCount: {
          select: 'replyCount',
          on: 'replyTo',
          from: 'threads',
          type: 'count',
        },
        bookmark: {
          select: 'bookmark',
          from: 'bookmarks',
          on: 'references', // references = row.id
          on2: 'type', // type = tableName
          type: 'token-reference',
          returning: 'id', // '*' or spesific column
        },
      },
      middlewares: {
        greetings: function (req, res, next) {
          console.log('Hello from middleware!')
          next()
        },
      },
    },
  },
}
```

The Object will generate the following entities:

1. **[GET] /posts**: Get all the posts from `posts` table. Default limit is 10. Route will be public to everyone. Only the `columns` are selected and `exclude`ds are not. The `populate`s are used to populate different kind of relations (I will explain these relations when they are standardized). Populate options are defined in the `define.populate` object.
2. **[GET] /posts/count**: Get post count.
3. **[GET] /posts/:id**: Get one post by id.
4. **[PUT] /posts/:id**: Update one post by id. Only the owner user can update the post because it uses `is-owner` middleware.
5. **[DELETE] /posts/:id**: Delete one post by id. Only the owner user can delete the post because it uses `is-owner` middleware.
6. **[POST] /posts**: Create a new post. Only the authenticated users can create a new post because it uses `authorization` middleware.

_this package is still in development_
