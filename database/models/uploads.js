export default {
  id: {
    type: 'increments',
    constraints: ['primary']
  },
  url: {
    type: 'text',
    constraints: ['notNullable'],
  },
  alt: {
    type: 'text',
  },
  user: {
    type: 'integer',
    comment: 'Image owner',
    references: 'users.id',
  },
  timestamps: [true, true]
}