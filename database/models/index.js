/*
## Description
- used for creating/deleting a database
- used for api router configurations
- and populate configurations
*/

// example:

const models = { // order is important for fk's
  // users: require('./users'),
  // uploads: require('./uploads'),
  // channels: require('./channels'),
  // communities: require('./communities'),
  // tags: require('./tags'),
  // posts: require('./posts'),
  // threads: require('./threads'),
  // bookmarks: require('./bookmarks'),
  // followers: require('./followers'),
}

module.exports = models

// a `posts.js` file can be like this:
// module.exports = {
//   id: {
//     type: 'increments',
//     constraints: ['primary']
//   },
//   user: {
//     type: 'integer',
//     constraints: ['notNullable'],
//     comment: 'author',
//     references: 'id',
//     inTable: 'users'
//   },
//   community: {
//     type: 'integer',
//     references: 'id',
//     inTable: 'communities'
//   },
//   channel: {
//     type: 'integer',
//     references: 'id',
//     inTable: 'channels',
//     defaultTo: 1,
//   },
//   title: {
//     type: 'string',
//     maxlength: 100,
//   },
//   published: {
//     type: 'boolean',
//     defaultTo: true
//   },
//   content: {
//     type: 'text',
//     constraints: ['notNullable']
//   },
//   description: {
//     type: 'string',
//     maxlength: 300,
//   },
//   thumbnail: {
//     type: 'integer',
//     references: 'uploads.id',
//   },
//   tags: {
//     type: 'string',
//   },
//   language: {
//     type: 'string',
//     constraints: ['notNullable']
//   },
//   timestamps: [true, true]
// }