// req.config
/*
{
  path: required | string
  method: required | post, get, path, put, delete, all
  controller: required | find, findOne, create, update, delete
  middleware: required | interceptor, authorization, is-owner... all in routes.js middlewares   object
  columns: optional | inherits from models. you can overwrite it. this property represents selected columns for the response
  exlude: optional | it exclude from columns array. columns should not be '*' for exclude to be working  
}
*/
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
      middlewares: ['is-owner'],
      populate: ['bookmark', 'user', 'category', 'thumbnail', 'responseCount', 'tags'],
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
      populate: ['bookmark', 'user', 'category', 'thumbnail'],
    },
  ],
  threads: [
    {
      path: '/threads',
      method: 'get',
      controller: 'find',
      query: {
        where: 'title-neq:null'
      },
      populate: ['bookmark', 'user', 'replyCount'],
    },
    {
      path: '/responses',
      method: 'get',
      controller: 'find',
      populate: ['bookmark', 'user', 'replyTo', 'responseTo', 'replyCount'],
    },
    {
      path: '/threads/count',
      method: 'get',
      controller: 'count',
      query: {
        where: 'title-neq:null'
      },
    },
    {
      path: '/responses/count',
      method: 'get',
      controller: 'count',
    },
    {
      path: '/threads/:id',
      method: 'get',
      controller: 'findOne',
      populate: ['bookmark', 'user', 'replyTo', 'responseTo', 'replyCount'],
    },
    {
      path: '/threads/:id',
      method: 'put',
      controller: 'update',
      middlewares: ['is-owner'],
      populate: ['bookmark', 'user', 'replyTo', 'responseTo', 'replyCount'],
    },
    {
      path: '/threads',
      method: 'post',
      controller: 'create',
      middlewares: ['authorization'],
      utils: ['detect-language'],
      populate: ['bookmark', 'user', 'replyTo', 'responseTo', 'replyCount'],
    },
    {
      path: '/threads/:id',
      method: 'delete',
      controller: 'delete',
      middlewares: ['is-owner'],
    },
  ],
  bookmarks: [
    {
      path: '/bookmarks',
      method: 'post',
      controller: 'create',
      middlewares: ['authorization'],
    },
    {
      path: '/bookmarks/:id',
      method: 'delete',
      controller: 'delete',
      middlewares: ['is-owner'],
    },
  ],
  tags: [
    {
      path: '/tags',
      method: 'get',
      controller: 'find',
    },
    {
      path: '/tags/:id',
      method: 'get',
      controller: 'findOne',
      populate: ['category'],
    },
  ],
  categories: [
    {
      path: '/categories',
      method: 'get',
      controller: 'find',
      query: {
        where: 'type:category',
      },
    },
    {
      path: '/communities',
      method: 'get',
      controller: 'find',
      query: {
        where: 'type:community',
      },
      populate: ['icon']
    },
    {
      path: '/categories/:name',
      method: 'get',
      controller: 'findOne',
      populate: ['icon', 'postCount', 'followerCountCategory', 'followingCategory']
    },
  ],
  users: [
    {
      path: '/users',
      method: 'get',
      controller: 'find',
      populate: ['followingUser'],
    },
    {
      path: '/users/:username',
      method: 'get',
      controller: 'findOne',
      populate: ['postCount', 'threadCount', 'followerCountUser', 'followingCount', 'bookmarkCount', 'followingUser'],
    },
    {
      path: '/users/me',
      method: 'put',
      controller: 'update',
      middlewares: ['is-owner'],
    },
  ],
  followers: [
    {
      path: '/followers',
      method: 'get',
      controller: 'find',
      populate: ['user']
    },
    {
      path: '/following',
      method: 'get',
      controller: 'find',
      populate: ['user']
    },
    {
      path: '/follow',
      method: 'post',
      controller: 'create',
      middlewares: ['authorization']
    },
    {
      path: '/follow/:id',
      method: 'delete',
      controller: 'delete',
      middlewares: ['is-owner']
    },
  ],
  uploads: [
    {
      path: '/uploads/:id',
      method: 'get',
      controller: 'findOne',
      middlewares: ['is-owner']
    },
    {
      path: '/uploads/:folder',
      method: 'post',
      controller: 'upload',
      middlewares: ['authorization']
    },
    {
      path: '/uploads/:id',
      method: 'put',
      controller: 'update',
      middlewares: ['is-owner']
    },
  ],
}
