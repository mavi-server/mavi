/* sub/populate config
## Description
- every fragment(column) is like a sub route used by the main routes
- each parent column can be used for populating relational data or datasets from these sub routes
- this parent column is usually an id or a virtual column
- example: the posts entity doesn't have column as `isLiked`, but you can populate it via `likes`.
  A user token will be required for this, and likes table should have a relation with the post ids.
*/

/*
## Configs
[tableName] {
  select <String>: alias or real column name
  from <String>: table name
  on <String>: column name - contextual column
  on2 <String>: column name - contextual column for type. tye property name can be changed later.
  type <String>: populate types - ['count', 'token-reference', 'array-reference', 'object', 'array'] can be used for most cases
  columns <Array>: (optional) - as default, inherits from models. you can overwrite it. this property represents columns that will be selected in the query
  exlude <Array>: (optional) - it exclude from columns array. columns option should not be '*' for exclude to be working
  returning <Array>: (optional) for token-reference. any existing column can be returned. also '*' can be used for returning all. multiple column selection is not supported yet.
}
*/
// These configs belong to one of my projects. You can get a concrete idea from the usage.
// Be sure that, the columns are defined in your database.
module.exports = {
  // user: {
  //   select: 'user',
  //   from: 'users',
  //   type: 'object',
  //   columns: ['id', 'username', 'email', 'avatar', 'fullname', 'created_at']
  // },
  // community: {
  //   select: 'community',
  //   from: 'communities',
  //   type: 'object',
  //   exclude: ['updated_at'],
  //   populate: ['icon'],
  // },
  // channel: {
  //   select: 'channel',
  //   from: 'channels',
  //   type: 'object',
  //   exclude: ['updated_at'],
  //   // populate: ['icon'],
  // },
  // thumbnail: {
  //   select: 'thumbnail',
  //   from: 'uploads',
  //   type: 'object',
  // },
  // icon: {
  //   select: 'icon',
  //   from: 'uploads',
  //   type: 'object',
  // },
  // replyTo: {
  //   select: 'replyTo',
  //   from: 'threads',
  //   type: 'object',
  //   exclude: ['content', 'timestamps']
  // },
  // responseTo: {
  //   select: 'responseTo',
  //   from: 'posts',
  //   type: 'object',
  //   columns: ['id', 'title', 'community', 'description'],
  //   populate: ['community']
  // },
  // tags: {
  //   select: 'tags',
  //   from: 'tags',
  //   type: 'array-reference',
  // },
  // responseCount: {
  //   select: 'responseCount',
  //   on: 'responseTo',
  //   from: 'threads',
  //   type: 'count'
  // },
  // replyCount: {
  //   select: 'replyCount',
  //   on: 'replyTo',
  //   from: 'threads',
  //   type: 'count'
  // },
  // postCount: {
  //   select: 'postCount',
  //   from: 'posts',
  //   on: 'user',
  //   type: 'count'
  // },
  // threadCount: {
  //   select: 'threadCount',
  //   from: 'threads',
  //   on: 'user',
  //   type: 'count'
  // },
  // bookmarkCount: {
  //   select: 'bookmarkCount',
  //   from: 'bookmarks',
  //   on: 'user',
  //   type: 'count',
  // },
  // followingCount: {
  //   select: 'followingCount',
  //   from: 'followers',
  //   on: 'user',
  //   type: 'count',
  // },
  // followerCount: {
  //   select: 'followerCount',
  //   from: 'followers',
  //   on: 'references',
  //   on2: 'type',
  //   type: 'count',
  // },
  // isFollowing: {
  //   select: 'isFollowing',
  //   from: 'followers',
  //   on: 'references',
  //   on2: 'type',
  //   type: 'token-reference',
  //   returning: 'id',
  // },
  // bookmark: {
  //   select: 'bookmark',
  //   from: 'bookmarks',
  //   on: 'references', // references = row.id
  //   on2: 'type', // type = tableName
  //   type: 'token-reference',
  //   returning: 'id', // '*' or spesific column
  // },
}