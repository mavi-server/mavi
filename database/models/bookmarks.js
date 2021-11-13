export default {
  id: {
    type: 'increments',
    constraints: ['primary']
  },
  user: {
    type: 'integer',
    constraints: ['notNullable'],
    references: 'id',
    inTable: 'users'
  },
  type: {
    type: 'enum',
    dataset: ['thread', 'post'],
    constraints: ['notNullable']
  },
  bookmark: { // post or thread id
    type: 'integer',
    constraints: ['notNullable']
  },
  timestamps: [true, true]
}