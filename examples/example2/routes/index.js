module.exports = {
  '/customers': [
    {
      path: '/',
      method: 'get',
      controller: 'find', // built-in controller
      populate: ['status'], // populates defined in config.api.define.populate
      middlewares: ['greetings'], // middlewares defined in config.api.define.middlewares
    },
    {
      path: '/',
      method: 'post',
      controller: 'create',
      populate: ['status'],
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
      populate: ['status'],
    },
    {
      path: '/:id',
      method: 'put',
      controller: 'update',
      populate: ['status'],
    },
    {
      path: '/:id',
      method: 'delete',
      controller: 'delete',
      populate: ['status'],
    },
  ],
  '/statuses': [
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
  ],
};
