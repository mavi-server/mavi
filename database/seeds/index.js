import users from './users';
import uploads from './uploads';
import tags from './tags';
import categories from './categories';
import posts from './posts';
import threads from './threads';
import bookmarks from './bookmarks';
import followers from './followers';

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