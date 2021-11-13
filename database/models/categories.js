export default {
  id: {
    type: 'increments',
    constraints: ['primary']
  },
  name: {
    type: 'string',
    maxlength: 15,
    constraints: ['notNullable']
  },
  icon: {
    type: 'integer',
    references: 'uploads.id',
  },
  type: {
    type: 'enum',
    dataset: ['category', 'community'],
    constraints: ['notNullable']
  },
  timestamps: [true, true]
}