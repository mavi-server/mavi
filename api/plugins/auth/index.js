module.exports = [
  {
    path: '/login',
    method: 'post',
    controller: require('./login'),
  },
  {
    path: '/logout',
    method: 'post',
    controller: require('./logout'),
  },
  {
    path: '/register',
    method: 'post',
    controller: require('./register'),
  },
]
