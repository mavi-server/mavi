module.exports = [
  {
    path: '/',
    method: 'get',
    controller: 'find',
  },
  {
    path: '/',
    method: 'post',
    controller: 'create',
  },
  {
    path: '/count',
    method: 'get',
    controller: 'count',
  },
  {
    path: '/:id',
    method: 'get',
    controller: 'findOne',
  },
  {
    path: '/:id',
    method: 'put',
    controller: 'update',
  },
  {
    path: '/:id',
    method: 'delete',
    controller: 'delete',
  },
];
