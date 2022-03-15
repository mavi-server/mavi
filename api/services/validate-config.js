// Default server configuration
const $config = require('../../config')

module.exports = function (config) {
  return new Promise((resolve, reject) => {
    if (!config) {
      reject(Error('config is not defined'))
    }

    // assign default configs if not provided
    for (const key in $config) {
      if (!(key in config)) config[key] = $config[key]
    }

    // Check missing configs:

    if (!config.api) {
      reject(Error('config.api is not defined'))
    }

    // assign default api configs if not provided
    for (const key in $config.api) {
      switch (key) {
        case 'base':
          if (config["base"]) {
            // append / from the beggining
            if (!config["base"].startsWith('/')) config["base"] = `/${config["base"]}`

            // remove / from the end
            if (config["base"].endsWith('/')) config["base"] = config["base"].slice(0, -1)
          }
          break
        default:
          // assign default api configs if not provided
          if (!config.api[key]) config.api[key] = $config.api[key]
      }

      if (!config.api[key]) config.api[key] = $config.api[key]
    }

    if (!config.api.base) {
      reject(Error('config.api.base is not defined'))
    }

    if (!config.api.routes) {
      reject(Error('config.api.routes is not defined'))
    }

    if (typeof config.api.routes !== 'object') {
      throw Error('config.api.routes must be an object')
    }

    if (!config.api.define) {
      reject(Error('config.api.define is not defined'))
    }

    if (!config.database) {
      reject(Error('config.database is not defined'))
    }

    if (config.database && !(config.database.development || config.database.production)) {
      reject(Error('config.database is invalid'))
    }

    resolve(config)
  })
}