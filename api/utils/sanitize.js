// sanitize incoming data
export default (data, { schema }) => {
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
    return sanitized
  }
  return data
}