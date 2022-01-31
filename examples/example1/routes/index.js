module.exports = {
  // [table name]: options{}
  customers: [
    {
      path: '/customers', // alias route
      method: 'get',
      controller: 'find', // built-in controller
      populate: ['status'], // populates defined in config.api.define.populate
      middlewares: ['greetings'] // middlewares defined in config.api.define.middlewares
    },
    {
      path: '/customers/count',
      method: 'get',
      controller: 'count',
    },
    {
      path: '/customers',
      method: 'post',
      controller: 'create',
    },
    {
      path: '/customers/:id',
      method: 'get',
      controller: 'findOne',
      populate: ['status'],
    },
    {
      path: '/customers/:id',
      method: 'put',
      controller: 'update',
    },
    {
      path: '/customers/:id',
      method: 'delete',
      controller: 'delete',
    },
  ],
  statuses: [
    {
      path: '/statuses',
      method: 'get',
      controller: 'find',
    },
    {
      path: '/statuses/count',
      method: 'get',
      controller: 'count',
    },
    {
      path: '/statuses',
      method: 'post',
      controller: 'create',
    },
    {
      path: '/statuses/:id',
      method: 'get',
      controller: 'findOne',
    },
    {
      path: '/statuses/:id',
      method: 'put',
      controller: 'update',
    },
    {
      path: '/statuses/:id',
      method: 'delete',
      controller: 'delete',
    },
  ]
}