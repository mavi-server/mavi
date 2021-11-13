export default {
  id: {
    type: 'increments',
    constraints: ['primary'],
  },
  username: {
    type: 'string',
    constraints: ['unique'],
    maxlength: 10,
  },
  email: {
    type: 'string',
    constraints: ['unique'],
    maxlength: 100,
  },
  fullname: {
    type: 'string',
    maxlength: 100,
  },
  password: {
    type: 'string',
    private: true
  },
  bio: {
    type: 'string',
    maxlength: 255,
  },
  blocked: {
    type: 'boolean',
    default: false
  },
  avatar: {
    type: 'string',
  },
  token: {
    type: 'text',
    private: true
  },
  refresh: {
    type: 'text',
    private: true
  },
  timestamps: [true, true]
}