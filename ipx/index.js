// A plugin that compressing the images
// https://www.npmjs.com/package/ipx

const { createIPX, createIPXMiddleware } = require('ipx')

// https://github.com/unjs/ipx
const ipx = createIPX({
  dir: '', // absolute path to images dir
  domains: [], // allowed external domains (should match domains option in nuxt.config)
  alias: {}, // base alias
  sharp: {}, // sharp options
})

module.exports = createIPXMiddleware(ipx)