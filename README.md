# Blue Server

Create an abstracted and extendible server from one JSON file!

This module aims to lift repetitive works that you have made every time building a server from scratch.

`Important`: This package needs much way to go. I do not recommend to use in production. I have plans to make this module more user friendly and I am open to collaborations and contributions.

## Example

The file below will create the entire server. You need to connect your database first then you can add some routes.

_Don't forget, the columns you choose on one route should be defined in your database too._

Define more populate options or middlewares to be able to use them in your routes.

```js
import { createServer } from 'blue-server'

export const server = createServer({
  routes: {
    posts: [
      {
        path: '/posts',
        method: 'get',
        controller: 'find',
        columns: [
          'id',
          'user',
          'title',
          'description',
          'published',
          'timestamps',
        ],
        populate: ['bookmark', 'user'],
        middleware: ['greetings'],
      },
    ],
  },
  define: {
    middleware: {
      // # middleware usage: https://expressjs.com/en/guide/using-middleware.html
      greetings: (req, res, next) => {
        console.log('Hello from middleware!')
        next()
      },
    },
    populate: {
      user: {
        select: 'user',
        from: 'users',
        type: 'object',
        columns: [
          'id',
          'username',
          'email',
          'avatar',
          'fullname',
          'created_at',
        ],
      },
      bookmark: {
        select: 'bookmark',
        from: 'bookmarks',
        type: 'token-reference',
      },
    },
  },
  database: {
    // # more options: https://knexjs.org/#Installation-client
    client: 'pg',
    version: import.meta.env.VITE_DB_VERSION || 1,
    connection: {
      database: import.meta.env.VITE_DB_NAME,
      user: import.meta.env.VITE_DB_USER,
      password: import.meta.env.VITE_DB_PASS,
    },
  },
})
```

The JSON file will become:

**[GET] /posts**: Fetching data from the `posts` table.
Route will be public to everyone. Only the `columns` are selected.
Also columns can be populated. The example above has `define.populate` object which includes **defined populate options**. You can use these in your `routes` just by calling their name in a `populate` array.

_I will specify more details as soon as i have time._

<!--
- _[GET]_ /posts/count -> get count from `posts` table. public to everyone.
- _[GET]_ /posts/:id -> get one result from `posts` table. public to everyone.
- _[PUT]_ /posts/:id -> update one entry from `posts` table. only owner can update.
- _[DELETE]_ /posts/:id -> delete one entry from `posts` table. only owner can delete.
- _[POST]_ /posts -> create one entry from `posts` table. only authorized users can create.
-->
