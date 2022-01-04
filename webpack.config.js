const path = require('path')

// https://webpack.js.org/configuration/
module.exports = {
  name: "server",
  target: "node",
  mode: 'production',
  entry: './api/index',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    // libraryTarget: 'umd',
    // globalObject: 'this',
  },
  resolve: {
    modules: [
      "node_modules"
    ],
    extensions: [".ts", ".js"],
    fallback: {
      "tty": false,
      "timers": false,
      "url": false,
      "util": false,
      "stream": false,
      "assert": false,
      "os": false,
      "crypto": false,
      "querystring": false,
      "http": false,
      "path": false,
      "fs": false,
      "net": false,
      "zlib": false,
      "pg-native": false,
      "sqlite3": false,
      "pg-query-stream": false,
      "oracledb": false,
      "mysql2": false,
      "mysql": false,
      "tedious": false,
    }
  },
}