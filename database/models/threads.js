export default {
  id: {
    type: 'increments',
    constraints: ['primary']
  },
  user: {
    type: 'integer',
    constraints: ['notNullable'],
    comment: 'author',
    references: 'users.id',
  },
  title: {
    type: 'string',
    maxlength: 100,
  },
  published: {
    type: 'boolean',
    defaultTo: true
  },
  content: {
    type: 'text',
    constraints: ['notNullable']
  },
  language: {
    type: 'string',
    constraints: ['notNullable']
  },
  replyTo: {
    type: 'integer',
    references: 'threads.id',
  },
  responseTo: {
    type: 'integer',
    references: 'posts.id',
  },
  timestamps: [true, true]
}