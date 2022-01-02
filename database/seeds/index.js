/*
## Description
- used for seeding a database
- fills your table with data
*/

// example:


const seeds = { // order is important for fk's
  // users: require('./users'),
  // uploads: require('./uploads'),
  // channels: require('./channels'),
  // communities: require('./communities'),
  // posts: require('./posts'),
  // threads: require('./threads'),
  // tags: require('./tags'),
  // bookmarks: require('./bookmarks'),
  // followers: require('./followers'),
}

module.exports = seeds

// * first of all be aware the relations exists or it won't work *
// a `posts.js` file can be like this:
// module.exports = [
//   {
//     "id": 1,
//     "user": 7,
//     "title": "cursus et velit id",
//     "description": "Integer cursus felis vitae tellus faucibus. Nam metus urna, ornare a diam quis, consectetur euismod ante. Nullam augue lorem, porta dictum facilisis ut, viverra vitae nibh",
//     "thumbnail": 26,
//     "published": true,
//     "community": 19,
//     "tags": "[1,2,3]",
//     "content": "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus.</p>",
//     "language": "turkish"
//   },
//   {
//     "id": 2,
//     "user": 2,
//     "title": "lorem ipsum dolor sit amet",
//     "description": "Aenean pretium euismod bibendum. Nam metus urna, ornare a diam quis, consectetur euismod ante. Nullam augue lorem, porta dictum facilisis ut, viverra vitae nibh",
//     "thumbnail": 26,
//     "published": true,
//     "community": 18,
//     "tags": "[1,2,3]",
//     "content": "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus. Donec eget nulla quis leo pharetra auctor vel et augue. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In at vehicula mi. Sed pellentesque eleifend maximus. Nam ullamcorper, metus in facilisis viverra, lacus ante interdum magna, non tincidunt eros nisl sed lectus.</p>",
//     "language": "english"
//   },
// }