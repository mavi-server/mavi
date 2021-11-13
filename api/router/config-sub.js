// * sub/populate config - each fragment(column) can be used for populating relational data or datasets
// * every fragment is like a sub route configuration of main routes

/*
{
  select: alias or real column name
  from: table name
  on: column name
  type: knex-populate.js types: count, token-reference, array-reference, object, array...
  columns: optional | inherits from models. you can overwrite it. this property represents selected columns for the response
  exlude: optional | it exclude from columns array. columns should not be '*' for exclude to be working  
  returning: optional for token-reference. any column. also '*' can be used for returning all. multiple selection is not supported.
}
*/
export default {
  user: {
    select: 'user',
    from: 'users',
    type: 'object',
    columns: ['id', 'username', 'email', 'avatar', 'fullname', 'created_at']
  },
  // followingUser: {
  //   select: 'user',
  //   from: 'users',
  //   type: 'object',
  //   columns: ['id', 'username', 'email', 'avatar', 'fullname', 'created_at']
  // },
  bookmark: {
    select: 'bookmark',
    from: 'bookmarks',
    type: 'token-reference',
  },
  category: {
    select: 'category',
    from: 'categories',
    type: 'object',
    exclude: ['updated_at'],
    populate: ['icon']
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
  responseCount: {
    select: 'responseCount',
    on: 'responseTo',
    from: 'threads',
    type: 'count'
  },
  replyTo: {
    select: 'replyTo',
    from: 'threads',
    type: 'object',
    exclude: ['content', 'timestamps']
  },
  responseTo: {
    select: 'responseTo',
    from: 'posts',
    type: 'object',
    columns: ['id', 'title', 'category', 'description'],
    populate: ['category']
  },
  replyCount: {
    select: 'replyCount',
    on: 'replyTo',
    from: 'threads',
    type: 'count'
  },
  tags: {
    select: 'tags',
    from: 'tags',
    type: 'array-reference',
  },
  postCount: {
    select: 'postCount',
    from: 'posts',
    on: 'user',
    type: 'count'
  },
  threadCount: {
    select: 'threadCount',
    from: 'threads',
    on: 'user',
    type: 'count'
  },
  followerCountCategory: {
    select: 'followerCount',
    from: 'followers',
    on: 'followingCategory',
    type: 'count',
  },
  followerCountUser: {
    select: 'followerCount',
    from: 'followers',
    on: 'followingUser',
    type: 'count',
  },
  followingCount: {
    select: 'followingCount',
    from: 'followers',
    on: 'user',
    type: 'count',
  },
  bookmarkCount: {
    select: 'bookmarkCount',
    from: 'bookmarks',
    on: 'user',
    type: 'count',
  },
  followingUser: {
    select: 'following',
    from: 'followers',
    on: 'followingUser',
    type: 'token-reference',
    returning: 'id' // '*' or spesific column
  },
  followingCategory: {
    select: 'following',
    from: 'followers',
    on: 'followingCategory',
    type: 'token-reference',
    returning: 'id' // '*' or spesific column
  },
}