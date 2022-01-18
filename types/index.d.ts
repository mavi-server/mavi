import { BlueServerConfig } from './server'

declare namespace BlueServer {
  /**
   * Creates a blue-server instance.
   */
  type createServer = (config: BlueServerConfig) => any
  type config = BlueServerConfig
}

export default BlueServer