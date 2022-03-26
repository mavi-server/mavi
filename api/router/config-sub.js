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
};