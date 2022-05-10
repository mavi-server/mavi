// you can also use json file
module.exports = {
  select: 'status',
  from: 'statuses',
  controller: 'object',
  columns: ['id', 'state', 'lastSeen', 'updated_at', 'created_at'], // default is all as `*`
  // exclude: ['id'] // you can also exclude columns  
};