export default {
  id: {
    type: 'increments',
    constraints: ['primary']
  },
  name: {
    type: 'string',
    constraints: ['notNullable', 'unique'],
    maxlength: 16
  },
  category: {
    type: 'integer',
    constraints: ['notNullable'],
    relation: 'categories.id'
  },
  timestamps: [true, true]
}