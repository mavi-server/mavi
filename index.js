// examples/basic-setup/index.js
import { createServer } from 'vite'
import { api } from './dist/blueserver.es.js'

const main = async () => {
  // blue server config
  const config = {}

  // create blue server
  const server = await api(config)

  // create vite server
  const vite = await createServer({
    configFile: false,
    server: {
      port: 3000,
      middlewareMode: 'ssr'
    }
  })

  server.use(vite.middlewares)
  server.listen(vite.config.server.port)
}

main()