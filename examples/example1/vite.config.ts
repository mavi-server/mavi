import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'
import path from 'path'

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express', // currently this plugin support 'express', 'nest', 'koa' and 'fastify' out of box
      appPath: '../../api/index.js',
      exportName: 'api',
      tsCompiler: 'esbuild',
    }),
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
    //   entry: path.resolve(__dirname, '../../api/index.js'),
    //   name: 'lib',
    //   fileName: (format) => `api.${format}.js`,
    // },
    rollupOptions: {
      external: [],
    }
  },
})