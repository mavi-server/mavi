import { createServer } from './api/index.js'

export const server = createServer({
  port: 3000,
  origin: 'http://localhost:3000',
  cors: {
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: ['*'],
    exposedHeaders: ['x-access-token']
  },
  routes: {
    posts: [
      {
        path: '/posts',
        method: 'get',
        controller: 'find',
        columns: ['id', 'user', 'title', 'description', 'published', 'timestamps',],
        populate: ['bookmark', 'user'],
      },
    ]
  },
  define: {
    middleware: {/* authorization, is-owner, interceptor */ },
    controller: {/* find, findOne, create, delete */ },
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
  },
  database: {
    development: {
      client: 'pg',
      version: 1,
      connection: {
        database: 'server-generator',
        user: 'postgres',
        password: 'admin',
      },
      pool: {
        min: 2,
        max: 10
      },
      migrations: {
        directory: './migrations',
        // schemaName: 'public',
        tableName: 'knex_migrations'
      },
      seeds: {
        directory: './migrations'
      }
    },
    production: {
      client: 'pg',
      version: import.meta.env.DB_VERSION || 1,
      connection: {
        database: import.meta.env.DB_NAME,
        user: import.meta.env.DB_USER,
        password: import.meta.env.DB_PASS
      },
      pool: {
        min: 2,
        max: 10
      },
      migrations: {
        directory: './migrations',
        // schemaName: 'public',
        tableName: 'knex_migrations'
      },
      seeds: {
        directory: './migrations'
      }
    }
  },
  // models: {
  //   posts: {
  //     id: {
  //       type: 'increments',
  //       constraints: ['primary']
  //     },
  //     user: {
  //       type: 'integer',
  //       constraints: ['notNullable'],
  //       comment: 'author',
  //       references: 'id',
  //       inTable: 'users'
  //     },
  //     title: {
  //       type: 'string',
  //       maxlength: 100,
  //     },
  //     description: {
  //       type: 'string',
  //       maxlength: 300,
  //     },
  //     published: {
  //       type: 'boolean',
  //       defaultTo: true
  //     },
  //     content: {
  //       type: 'text',
  //       constraints: ['notNullable']
  //     },
  //     timestamps: [true, true]
  //   }
  // },
  // seeds: {
  //   posts: [
  //     {
  //       title: 'This duck is smarter than you',
  //       description: "Maybe you won't believe it, but science says it is",
  //       user: 1,
  //       category: 1,
  //       content: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue.</p>`,
  //     }
  //   ]
  // },
  vite: {},
})