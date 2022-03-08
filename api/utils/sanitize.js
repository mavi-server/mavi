// sanitize incoming data
module.exports = (data, { schema }) => {
  if (data) {
    const sanitized = {}

    // prevent forein columns to be sent to the database
    schema.forEach(c => {
      if (typeof data[c] !== 'undefined') {
        // clean proceses
        // data[c] = data[c]

        // assign
        sanitized[c] = data[c]
        // also needs to be sanitized. i'll improve it later
      }
    })

    // prevent objects with id properties to be send as objects
    for (let c in sanitized) {
      if (sanitized[c] && typeof sanitized[c] === 'object' && 'id' in sanitized[c]) {
        // sql queries only accepts id:
        sanitized[c] = sanitized[c].id || undefined
      }
      else if (typeof sanitized[c] === 'object' && !Array.isArray(sanitized[c])) {
        // if cilent sends an object without id, query builder can't handle it:
        sanitized[c] = null // set object to null
      }
      else if (Array.isArray(sanitized[c])) {
        // sanitize arrays
        sanitized[c] = sanitized[c].map(item => {
          if (item && typeof item === 'object') return item.id || null
          else return item
        })
        sanitized[c] = JSON.stringify(sanitized[c])
      }
    }

    return sanitized
  }
  return data
}