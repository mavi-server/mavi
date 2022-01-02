
/*
## Description
- used in req.config
- generates the api with the given config
- can be extendable by middlewares
- a later plan: these will be customizable on the UI
*/

/*
## Configs
{
  path <String>: (required)
  method <String>: (required) - post, get, path, put, delete, all
  controller <String>: (required) - find, findOne, create, update, delete
  middleware <String, Object>: (required) - interceptor, authorization, is-owner... all in routes.js middlewares
  columns <Array>: (optional) - inherits from models. you can overwrite it. this property represents selected columns for the response
  exlude <Array>: (optional) - it exclude from columns array. columns should not be '*' for exclude to be working
  populate <Array>: (optional) - it populate the response with the given columns
  view <String>: (optional) - the view name. if not defined, the controller name will be used
}
*/

// These configs belong to one of my projects. You can get a concrete idea from the usage.
// Be sure that, the columns are defined in your database.
module.exports = {
  // posts: [
  //   {
  //     path: '/posts',
  //     method: 'get',
  //     controller: 'find',
  //     exclude: ['content'],
  //     populate: ['bookmark', 'user', 'community', 'thumbnail', 'responseCount'],
  //   },
  //   {
  //     path: '/posts/count',
  //     method: 'get',
  //     controller: 'count',
  //   },
  //   {
  //     path: '/posts/:id',
  //     method: 'get',
  //     controller: 'findOne',
  //     populate: ['bookmark', 'user', 'community', 'thumbnail', 'responseCount', 'tags'],
  //   },
  //   {
  //     path: '/posts/:id',
  //     method: 'put',
  //     controller: 'update',
  //     middlewares: ['is-owner'],
  //     populate: ['bookmark', 'user', 'community', 'thumbnail', 'responseCount', 'tags'],
  //   },
  //   {
  //     path: '/posts/:id',
  //     method: 'delete',
  //     controller: 'delete',
  //     middlewares: ['is-owner'],
  //   },
  //   {
  //     path: '/posts',
  //     method: 'post',
  //     controller: 'create',
  //     middlewares: ['authorization'],
  //     utils: ['detect-language'],
  //     populate: ['bookmark', 'user', 'community', 'thumbnail'],
  //   },
  // ],
  // threads: [
  //   {
  //     path: '/threads',
  //     method: 'get',
  //     controller: 'find',
  //     query: {
  //       where: 'title-neq:null'
  //     },
  //     populate: ['community', 'bookmark', 'user', 'replyCount'],
  //   },
  //   {
  //     path: '/responses',
  //     method: 'get',
  //     controller: 'find',
  //     populate: ['bookmark', 'user', 'replyTo', 'responseTo', 'replyCount'],
  //   },
  //   {
  //     path: '/threads/count',
  //     method: 'get',
  //     controller: 'count',
  //     query: {
  //       where: 'title-neq:null'
  //     },
  //   },
  //   {
  //     path: '/responses/count',
  //     method: 'get',
  //     controller: 'count',
  //   },
  //   {
  //     path: '/threads/:id',
  //     method: 'get',
  //     controller: 'findOne',
  //     populate: ['bookmark', 'user', 'replyTo', 'responseTo', 'replyCount'],
  //   },
  //   {
  //     path: '/threads/:id',
  //     method: 'put',
  //     controller: 'update',
  //     middlewares: ['is-owner'],
  //     populate: ['bookmark', 'user', 'replyTo', 'responseTo', 'replyCount'],
  //   },
  //   {
  //     path: '/threads',
  //     method: 'post',
  //     controller: 'create',
  //     middlewares: ['authorization'],
  //     utils: ['detect-language'],
  //     populate: ['bookmark', 'user', 'replyTo', 'responseTo', 'replyCount'],
  //   },
  //   {
  //     path: '/threads/:id',
  //     method: 'delete',
  //     controller: 'delete',
  //     middlewares: ['is-owner'],
  //   },
  // ],
  // bookmarks: [
  //   {
  //     path: '/bookmarks',
  //     method: 'post',
  //     controller: 'create',
  //     middlewares: ['authorization'],
  //   },
  //   {
  //     path: '/bookmarks/:id',
  //     method: 'delete',
  //     controller: 'delete',
  //     middlewares: ['is-owner'],
  //   },
  // ],
  // tags: [
  //   {
  //     path: '/tags',
  //     method: 'get',
  //     controller: 'find',
  //   },
  //   {
  //     path: '/tags/:id',
  //     method: 'get',
  //     controller: 'findOne',
  //     populate: ['community'],
  //   },
  // ],
  // channels: [
  //   {
  //     path: '/channels',
  //     method: 'get',
  //     controller: 'find',
  //   },
  //   {
  //     path: '/channels/:id',
  //     method: 'get',
  //     controller: 'find',
  //     view: 'channel_feeds',
  //     populate: ['bookmark', 'user', 'thumbnail', 'responseCount'],
  //   },
  //   {
  //     path: '/channels/:id/count',
  //     method: 'get',
  //     controller: 'count',
  //     view: 'channel_feeds',
  //   },
  // ],
  // communities: [
  //   {
  //     path: '/communities',
  //     method: 'get',
  //     controller: 'find',
  //     populate: ['icon']
  //   },
  //   {
  //     path: '/communities/:name',
  //     method: 'get',
  //     controller: 'findOne',
  //     populate: ['channel', 'icon', 'postCount', 'followerCount', 'isFollowing']
  //   },
  // ],
  // users: [
  //   {
  //     path: '/users',
  //     method: 'get',
  //     controller: 'find',
  //     populate: ['isFollowing'],
  //   },
  //   {
  //     path: '/users/:username',
  //     method: 'get',
  //     controller: 'findOne',
  //     populate: ['isFollowing', 'postCount', 'threadCount', 'followerCount', 'followingCount', 'bookmarkCount'],
  //   },
  //   {
  //     path: '/users/me',
  //     method: 'put',
  //     controller: 'update',
  //     middlewares: ['is-owner'],
  //   },
  // ],
  // followers: [
  //   {
  //     path: '/followers',
  //     method: 'get',
  //     controller: 'find',
  //     populate: ['user']
  //   },
  //   {
  //     path: '/following',
  //     method: 'get',
  //     controller: 'find',
  //     populate: ['user']
  //   },
  //   {
  //     path: '/follow',
  //     method: 'post',
  //     controller: 'create',
  //     middlewares: ['authorization']
  //   },
  //   {
  //     path: '/follow/:id',
  //     method: 'delete',
  //     controller: 'delete',
  //     middlewares: ['is-owner']
  //   },
  // ],
  // uploads: [
  //   {
  //     path: '/uploads/:id',
  //     method: 'get',
  //     controller: 'findOne',
  //     middlewares: ['is-owner']
  //   },
  //   {
  //     path: '/uploads/:folder',
  //     method: 'post',
  //     controller: 'upload',
  //     middlewares: ['authorization']
  //   },
  //   {
  //     path: '/uploads/:id',
  //     method: 'put',
  //     controller: 'update',
  //     middlewares: ['is-owner']
  //   },
  // ],
}
