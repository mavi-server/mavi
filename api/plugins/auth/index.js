const auth = {
  login: require('./login'),
  logout: require('./logout'),
  register: require('./register'),
}

module.exports = [
  {
    path: '/login',
    method: 'post',
    controller: auth.login,
  },
  {
    path: '/logout',
    method: 'post',
    controller: auth.logout,
  },
  {
    path: '/register',
    method: 'post',
    controller: auth.register,
  },
]
