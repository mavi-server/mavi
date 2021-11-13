export default {
  id: {
    type: 'increments',
    constraints: ['primary']
  },
  user: {
    type: 'integer',
    constraints: ['notNullable'],
    comment: 'author',
    references: 'id',
    inTable: 'users'
  },
  title: {
    type: 'string',
    maxlength: 100,
  },
  description: {
    type: 'string',
    maxlength: 300,
  },
  thumbnail: {
    type: 'integer',
    references: 'uploads.id',
  },
  published: {
    type: 'boolean',
    defaultTo: true
  },
  category: {
    type: 'integer',
    constraints: ['notNullable'],
    references: 'id',
    inTable: 'categories'
  },
  tags: {
    type: 'string',
  },
  content: {
    type: 'text',
    constraints: ['notNullable']
  },
  language: {
    type: 'string',
    constraints: ['notNullable']
  },
  timestamps: [true, true]
}