
// These configs belong to one of my projects. You can get a concrete idea from the usage.
// Be sure of that, the columns should be defined on your database.
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
};
