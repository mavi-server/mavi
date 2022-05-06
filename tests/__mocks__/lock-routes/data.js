module.exports = [
  {
    model: 'customers',
    path: '/all',
    method: 'get',
    controller: 'find',
    query: '$',
  },
  {
    model: 'customers',
    path: '/limit',
    method: 'get',
    controller: 'find',
    query: {
      limit: '$',
    },
  },
  {
    model: 'customers',
    path: '/limit-with-value',
    method: 'get',
    controller: 'find',
    query: {
      limit: [5],
    },
  },
  {
    model: 'customers',
    path: '/start',
    method: 'get',
    controller: 'find',
    query: {
      start: '$',
    },
  },
  {
    model: 'customers',
    path: '/start-with-value',
    method: 'get',
    controller: 'find',
    query: {
      start: [2],
    },
  },
  {
    model: 'customers',
    path: '/sort',
    method: 'get',
    controller: 'find',
    query: {
      sort: '$',
    },
  },
  {
    model: 'customers',
    path: '/sort-with-value',
    method: 'get',
    controller: 'find',
    query: {
      sort: ['name-desc,id-asc'],
    },
  },
  {
    model: 'customers',
    path: '/where',
    method: 'get',
    controller: 'find',
    query: {
      where: '$',
    },
  },
  {
    model: 'customers',
    path: '/where-with-value',
    method: 'get',
    controller: 'find',
    query: {
      where: ['name-john'],
    },
  },
  {
    model: 'customers',
    path: '/where-with-some-columns',
    method: 'get',
    controller: 'find',
    query: {
      where: '$name-john and status-1',
    },
  },
  {
    model: 'customers',
    path: '/exclude',
    method: 'get',
    controller: 'find',
    query: {
      exclude: '$',
    },
  },
  {
    model: 'customers',
    path: '/exclude-with-value',
    method: 'get',
    controller: 'find',
    query: {
      exclude: ['name'],
    },
  },
];
