/*
## Description
- used for more advanced queries
- it's not creating the real views, maybe it should be
*/

module.exports = {
  // channel_feeds: require('./channel_feeds'),
}

// a `channel_feeds.js` file can be like this:
// module.exports = (knex, id) => {
//   const select1 = "p.id, p.user, p.channel, p.title, p.published, p.created_at, p.content, p.language, p.description, p.thumbnail, c.name as community, c.channel, 'post' as type"
//   const select2 = "t.id, t.user, t.channel, t.title, t.published, t.created_at, t.content, t.language, '' as description, 0 as thumbnail, c.name as community, c.channel, 'thread' as type"
//   return knex
//     .select(knex.raw(select1))
//     .from('posts as p')
//     .joinRaw('inner join communities c on p.community = c.id')
//     .whereRaw(`c.channel = ${id} OR p.channel = ${id}`)
//     .unionAll(function () {
//       this.select(knex.raw(select2))
//         .from('threads as t')
//         .joinRaw('inner join communities c on t.community = c.id')
//         .whereRaw(`c.channel = ${id} OR t.channel = ${id}`)
//     })
// }
