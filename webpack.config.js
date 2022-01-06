const path = require('path')
const nodeExternals = require('webpack-node-externals')

// https://webpack.js.org/configuration/
module.exports = {
  name: "server",
  externalsPresets: { node: true }, // in order to ignore built-in modules like path, fs, etc.
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder
  mode: 'production',
  entry: './api/index',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
}