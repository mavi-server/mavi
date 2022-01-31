module.exports = {
  status: {
    select: 'status',
    from: 'statuses',
    type: 'object',
    columns: ['id', 'state', 'lastSeen', 'updated_at', 'created_at'] // default is all as `*`
    // exclude: ['id'] // you can also exclude columns
  },
}