const ipx = require('./middleware/ipx')
module.exports = [
  {
    path: '/ipx',
    method: 'get',
    controller: ipx,
  },
]