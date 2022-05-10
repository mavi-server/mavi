import type { MaviConfig } from '../../../types/index'

const state: MaviConfig = {
  host: 'localhost',
  port: 3001,
  poweredBy: 'Mavi',
  timer: true,
  cors: {
    origin: ['*'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['x-access-token', 'x-refresh-token', 'token', 'content-type', 'accept'],
  },
  static: {
    base: '/',
    folder: '../public',
    options: {},
  },
  database: {
    development: {
      client: 'pg',
      connection: {
        database: 'process.env.DEV_DB_NAME',
        user: 'process.env.DEV_DB_USER',
        password: 'process.env.DEV_DB_PASS'
      },
      pool: {
        min: 2,
        max: 10
      },
      debug: false,
    },
    production: {
      client: 'pg',
      connection: {
        database: process.env.PRO_DB_NAME,
        user: process.env.PRO_DB_USER,
        password: process.env.PRO_DB_PASS
      },
      pool: {
        min: 2,
        max: 10
      },
      debug: false,
    },
  },
  api: {
    base: '/api',
    routes: {
      '/': [
        {
          path: '/',
          method: 'get',
          serve: {
            folder: 'public',
            dotfiles: 'ignore',
            etag: false,
            extensions: ['png', 'jpg', 'jpeg', 'gif', 'ico', 'svg'],
            maxAge: '1d',
          }
        }
      ],
      '/posts': [
        {
          path: '/',
          method: 'get',
          controller: 'find',
          exclude: ['content'],
          populate: ['bookmark', 'user', 'community', 'thumbnail', 'responseCount'],
        },
        {
          path: '/count',
          method: 'get',
          controller: 'count',
        },
        {
          path: '/:id',
          method: 'get',
          controller: 'findOne',
          populate: ['bookmark', 'user', 'community', 'thumbnail', 'responseCount', 'tags'],
        },
        {
          path: '/:id',
          method: 'put',
          controller: 'update',
          middlewares: ['is-owner'],
          populate: ['bookmark', 'user', 'community', 'thumbnail', 'responseCount', 'tags'],
        },
        {
          path: '/:id',
          method: 'delete',
          controller: 'delete',
          middlewares: ['is-owner'],
        },
        {
          path: '/',
          method: 'post',
          controller: 'create',
          middlewares: ['authorization'],
          populate: ['bookmark', 'user', 'community', 'thumbnail'],
        },
      ],
      '/uploads': [
        {
          path: '/',
          method: 'get',
          serve: {
            folder: 'uploads',
            dotfiles: 'ignore',
            etag: false,
            extensions: ['png', 'jpg', 'jpeg', 'gif', 'ico', 'svg'],
            maxAge: '1d',
          }
        },
        {
          path: '/list',
          method: 'get',
          controller: 'find',
        },
        {
          path: '/:id',
          method: 'get',
          controller: 'findOne',
          middlewares: ['is-owner']
        },
        {
          path: '/:folder',
          method: 'post',
          controller: ['upload', {
            accept: 'image',
            folders: ['avatars', 'thumbnails'],
            maxFileSize: 5242880, // bytes = 5mb
          }],
          middlewares: ['authorization']
        },
        {
          path: '/:id',
          method: 'put',
          controller: 'update',
          middlewares: ['is-owner']
        },
      ]
    },
    define: {
      models: {
        users: {
          id: {
            type: "increments",
            constraints: ["primary"],
            hash: "WzE2NDMyMTk4NjY1MDRddXNlcnMuaWQ"
          },
          username: {
            type: "string",
            constraints: ["unique"],
            maxlength: 18,
            hash: "WzE2NDMyMTk4Nzc0MjRddXNlcnMudXNlcm5hbWU"
          },
          email: {
            type: "string",
            constraints: ["unique"],
            maxlength: 100,
            hash: "WzE2NDMyMjA4Nzg4MDdddXNlcnMuZW1haWw"
          },
          fullname: {
            type: "string",
            maxlength: 100,
            hash: "WzE2NDMyMjE0OTg0NzFdbXl1c2Vycy5mdWxsbmFtZQ"
          },
          password: {
            type: "string",
            private: true,
            hash: "WzE2NDMzOTk3MzA4MjJddXNlcnMucGFzc3dvcmQ"
          },
          bio: { type: "string", maxlength: 255, hash: "dXNlcnMuYmlv" },
          blocked: { type: "boolean", default: false, hash: "dXNlcnMuYmxvY2tlZA" },
          avatar: { type: "text", hash: "dXNlcnMuYXZhdGFy" },
          token: { type: "text", private: true, hash: "dXNlcnMudG9rZW4" },
          refresh: { type: "text", private: true, hash: "dXNlcnMucmVmcmVzaA" },
          updated_at: {
            type: "timestamp",
            useTz: true,
            precision: 6,
            hash: "dXNlcnMudXBkYXRlZF9hdA"
          },
          created_at: {
            type: "timestamp",
            useTz: true,
            precision: 6,
            hash: "dXNlcnMuY3JlYXRlZF9hdA"
          },
          hash: "dXNlcnM"
        },
        uploads: {
          id: {
            type: 'increments',
            constraints: ['primary'],
            hash: 'dXBsb2Fkcy5pZA'
          },
          url: {
            type: 'text',
            constraints: ['notNullable'],
            hash: 'dXBsb2Fkcy51cmw'
          },
          alt: { type: 'text', hash: 'dXBsb2Fkcy5hbHQ' },
          user: {
            type: 'integer',
            comment: 'Image owner',
            references: 'users.id',
            hash: 'dXBsb2Fkcy51c2Vy'
          },
          updated_at: {
            type: 'timestamp',
            useTz: true,
            precision: 6,
            hash: 'dXBsb2Fkcy51cGRhdGVkX2F0'
          },
          created_at: {
            type: 'timestamp',
            useTz: true,
            precision: 6,
            hash: 'dXBsb2Fkcy5jcmVhdGVkX2F0'
          },
          hash: 'dXBsb2Fkcw'
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
            references: 'users.id',
            onDelete: 'cascade',
            onUpdate: 'cascade',
            comment: 'author',
            hash: 'cG9zdHMudXNlcg'
          },
          community: {
            type: 'integer',
            references: 'communities.id',
            onDelete: 'cascade',
            onUpdate: 'cascade',
            hash: 'cG9zdHMuY29tbXVuaXR5'
          },
          channel: {
            type: 'integer',
            references: 'channels.id',
            defaultTo: 1,
            onDelete: 'cascade',
            onUpdate: 'cascade',
            hash: 'cG9zdHMuY2hhbm5lbA'
          },
          title: { type: 'string', maxlength: 100, hash: 'cG9zdHMudGl0bGU' },
          published: { type: 'boolean', defaultTo: true, hash: 'cG9zdHMucHVibGlzaGVk' },
          content: {
            type: 'text',
            constraints: ['notNullable'],
            hash: 'cG9zdHMuY29udGVudA'
          },
          description: { type: 'string', maxlength: 300, hash: 'cG9zdHMuZGVzY3JpcHRpb24' },
          thumbnail: {
            type: 'integer',
            references: 'uploads.id',
            hash: 'cG9zdHMudGh1bWJuYWls'
          },
          tags: { type: 'string', hash: 'cG9zdHMudGFncw' },
          language: {
            type: 'string',
            constraints: ['notNullable'],
            hash: 'cG9zdHMubGFuZ3VhZ2U'
          },
          updated_at: {
            type: 'timestamp',
            useTz: true,
            precision: 6,
            hash: 'cG9zdHMudXBkYXRlZF9hdA'
          },
          created_at: {
            type: 'timestamp',
            useTz: true,
            precision: 6,
            hash: 'cG9zdHMuY3JlYXRlZF9hdA'
          },
          hash: 'WzE2NDM1Nzg3NDYwNzBdcG9zdHM'
        }
      },
      populate: {
        user: {
          select: 'user',
          from: 'users',
          controller: 'object',
          columns: ['id', 'username', 'email', 'avatar', 'fullname', 'created_at']
        },
        community: {
          select: 'community',
          from: 'communities',
          controller: 'object',
          exclude: ['updated_at'],
          populate: ['icon'],
        },
        channel: {
          select: 'channel',
          from: 'channels',
          controller: 'object',
          exclude: ['updated_at'],
          // populate: ['icon'],
        },
        thumbnail: {
          select: 'thumbnail',
          from: 'uploads',
          controller: 'object',
        },
        icon: {
          select: 'icon',
          from: 'uploads',
          controller: 'object',
        },
        replyTo: {
          select: 'replyTo',
          from: 'threads',
          controller: 'object',
          exclude: ['content', 'timestamps']
        },
        responseTo: {
          select: 'responseTo',
          from: 'posts',
          controller: 'object',
          columns: ['id', 'title', 'community', 'description'],
          populate: ['community']
        },
        tags: {
          select: 'tags',
          from: 'tags',
          controller: 'array-reference',
        },
        responseCount: {
          select: 'responseCount',
          on: 'responseTo',
          from: 'threads',
          controller: 'count'
        },
        replyCount: {
          select: 'replyCount',
          from: 'threads',
          on: 'replyTo',
          controller: 'count'
        },
        postCount: {
          select: 'postCount',
          from: 'posts',
          on: 'user',
          controller: 'count'
        },
        threadCount: {
          select: 'threadCount',
          from: 'threads',
          on: 'user',
          controller: 'count',
          query: {
            where: 'title-neq-null',
          },
        },
        commentCount: {
          select: 'commentCount', // row[select] // assign populated data into this column
          from: 'threads', // fetch data from this table
          on: 'user', // where-[on]-req-row.id
          controller: 'count', // count rows
          query: {
            where: 'title-null',
          },
        },
        bookmarkCount: {
          select: 'bookmarkCount',
          from: 'bookmarks',
          on: 'user',
          controller: 'count',
        },
        followingCount: {
          select: 'followingCount',
          from: 'followers',
          on: 'user',
          controller: 'count',
        },
        followerCount: {
          select: 'followerCount',
          from: 'followers',
          on: 'references',
          on2: 'type',
          controller: 'count',
        },
        isFollowing: {
          select: 'isFollowing',
          from: 'followers',
          on: 'references',
          on2: 'type',
          controller: 'token-reference',
          returning: 'id',
        },
        bookmark: {
          select: 'bookmark',
          from: 'bookmarks',
          on: 'references', // references = row.id
          on2: 'type', // type = tableName
          controller: 'token-reference',
          returning: 'id', // '*' or specific column
        },
      },
      utils: {},
      middlewares: {},
      controllers: {},
    },
  }
}

export default state