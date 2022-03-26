module.exports = {
  id: {
    type: 'integer',
    constraints: ['primary'],
    hash: 'WzE2NDM2Mzc0MTMzODBdY3VzdG9tZXJzLmlk',
  },
  name: {
    type: 'string',
    maxLength: 100,
    hash: 'WzE2NDM2Mzc0MTMzODBdY3VzdG9tZXJzLm5hbWU',
  },
  email: {
    type: 'string',
    maxLength: 100,
    hash: 'WzE2NDM2Mzc0MTMzODBdY3VzdG9tZXJzLmVtYWls',
  },
  gender: {
    type: 'enum',
    dataset: ['male', 'female'],
    hash: 'WzE2NDM2Mzc0MTMzODBdY3VzdG9tZXJzLmdlbmRlcg',
  },
  status: {
    type: 'integer',
    references: 'statuses.id',
    defaultTo: 1,
    constraints: ['notNullable'],
    comment: 'customer status',
    hash: 'WzE2NDM2Mzc0MTMzODFdY3VzdG9tZXJzLnN0YXR1cw',
  },
  updated_at: {
    type: 'timestamp',
    useTz: true,
    precision: 6,
    hash: 'WzE2NDM2Mzc0MTMzODFdY3VzdG9tZXJzLnVwZGF0ZWRfYXQ',
  },
  created_at: {
    type: 'timestamp',
    useTz: true,
    precision: 6,
    hash: 'WzE2NDM2Mzc0MTMzODFdY3VzdG9tZXJzLmNyZWF0ZWRfYXQ',
  },
  hash: 'WzE2NDM2Mzc0MTMzNzldY3VzdG9tZXJz',
};