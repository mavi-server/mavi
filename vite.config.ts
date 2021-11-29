import { defineConfig } from 'vite'
// import { VitePluginNode } from 'vite-plugin-node'
import path from 'path'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    // ...VitePluginNode({
    //   adapter: 'express', // currently this plugin support 'express', 'nest', 'koa' and 'fastify' out of box
    //   appPath: './blue.server.js',
    //   exportName: 'server', // same as the name of the exported object
    //   tsCompiler: 'esbuild',
    // }),
  ],
  resolve: {
    alias: [{
      find: '@',
      replacement: path.resolve(__dirname)
    }]
  },
  build: {
    chunkSizeWarningLimit: 1024 * 1024 * 2, // 2MB
    // lib: {
    //   entry: path.resolve(__dirname, './blue.server.js'),
    //   name: 'lib',
    //   fileName: (format) => `api.${format}.js`,
    // },
    rollupOptions: {
      external: [],
    }
  },
})