export default {
  id: {
    type: 'increments',
    constraints: ['primary']
  },
  user: { // follower
    type: 'integer',
    constraints: ['notNullable'],
    references: 'users.id',
  },
  followingUser: {
    type: 'integer',
    references: 'users.id'
  },
  followingCategory: {
    type: 'integer',
    references: 'categories.id'
  },
  timestamps: [true, true]
}