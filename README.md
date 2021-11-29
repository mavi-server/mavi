# Blue Server

Create an abstracted and extendible server from one JSON file!

`Important`: This package needs too much way to go. Not recommended to use in production. I have plans to make this plugin more user friendly later, also i'm open to pull requests.

## Example

The JSON file below, will create an API entity.

```js
export default {
  posts: [
    {
      path: '/posts',
      method: 'get',
      controller: 'find',
      exclude: ['content'],
      populate: ['bookmark', 'user', 'category', 'thumbnail', 'responseCount'],
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
      populate: ['bookmark', 'user', 'category', 'thumbnail', 'responseCount', 'tags'],
    },
    {
      path: '/posts/:id',
      method: 'put',
      controller: 'update',
      middleware: ['is-owner'],
      populate: ['bookmark', 'user', 'category', 'thumbnail', 'responseCount', 'tags'],
    },
    {
      path: '/posts/:id',
      method: 'delete',
      controller: 'delete',
      middleware: ['is-owner'],
    },
    {
      path: '/posts',
      method: 'post',
      controller: 'create',
      middleware: ['authorization'],
      utils: ['detect-language'],
      populate: ['bookmark', 'user', 'category', 'thumbnail'],
    },
  ],
  ...
 }
```

the JSON file will become:

- _[GET]_ /posts -> get posts from `posts` table. public to everyone.
- _[GET]_ /posts/count -> get count from `posts` table. public to everyone.
- _[GET]_ /posts/:id -> get one result from `posts` table. public to everyone.
- _[PUT]_ /posts/:id -> update one entry from `posts` table. only owner can update.
- _[DELETE]_ /posts/:id -> delete one entry from `posts` table. only owner can delete.
- _[POST]_ /posts -> create one entry from `posts` table. only authorized users can create.
