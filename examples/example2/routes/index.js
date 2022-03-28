module.exports = {
  '/customers': [
    // {
    //   path: '/',
    //   method: 'get',
    //   controller: 'find', // built-in controller
    //   populate: ['status'], // populates defined in config.api.define.populate
    //   middlewares: ['greetings'], // middlewares defined in config.api.define.middlewares
    // },
    {
      path: '/count',
      method: 'get',
      controller: 'count',
    },
    // {
    //   path: '/',
    //   method: 'post',
    //   controller: 'create',
    // },
    // {
    //   path: '/:id',
    //   method: 'get',
    //   controller: 'findOne',
    //   populate: ['status'],
    // },
    // {
    //   path: '/:id',
    //   method: 'put',
    //   controller: 'update',
    // },
    // {
    //   path: '/:id',
    //   method: 'delete',
    //   controller: 'delete',
    // },
  ],
  '/statuses': [
    {
      path: '/',
      method: 'get',
      controller: 'find',
    },
    {
      path: '/count',
      method: 'get',
      controller: 'count',
    },
    // {
    //   path: '/',
    //   method: 'post',
    //   controller: 'create',
    // },
    // {
    //   path: '/:id',
    //   method: 'get',
    //   controller: 'findOne',
    // },
    // {
    //   path: '/:id',
    //   method: 'put',
    //   controller: 'update',
    // },
    // {
    //   path: '/:id',
    //   method: 'delete',
    //   controller: 'delete',
    // },
  ],
};