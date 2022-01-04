const upload = require('./middleware/upload')
module.exports = [
  {
    path: '/uploads/:id',
    method: 'get',
    controller: 'findOne',
    middlewares: ['is-owner', upload()]
  },
  {
    path: '/uploads/:folder',
    method: 'post',
    controller: 'upload',
    middlewares: ['authorization', upload()]
  },
  {
    path: '/uploads/:id',
    method: 'put',
    controller: 'update',
    middlewares: ['is-owner', upload()]
  },
]