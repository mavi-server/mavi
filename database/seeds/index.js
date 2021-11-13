import users from './users.js';
import uploads from './uploads.js';
import tags from './tags.js';
import categories from './categories.js';
import posts from './posts.js';
import threads from './threads.js';
import bookmarks from './bookmarks.js';
import followers from './followers.js';

const seeds = { // order is important for fk's
  users,
  uploads,
  tags,
  categories,
  posts,
  threads,
  bookmarks,
  followers,
}

export default seeds