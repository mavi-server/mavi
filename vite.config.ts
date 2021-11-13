import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'
import path from 'path'

// process.env:
import dotenv from 'dotenv'
dotenv.config({ path: './.env' })

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    ...VitePluginNode({
      // Nodejs native Request adapter
      // currently this plugin support 'express', 'nest', 'koa' and 'fastify' out of box,
      // you can also pass a function if you are using other frameworks, see Custom Adapter section
      adapter: 'express', 

      // tell the plugin where is your project entry
      appPath: './api/index.js',

      // Optional, default: 'viteNodeApp' 
      // the name of named export of you app from the appPath file
      exportName: 'api',

      // Optional, default: 'esbuild'
      // The TypeScript compiler you want to use
      // by default this plugin is using vite default ts compiler which is esbuild
      // 'swc' compiler is supported to use as well for frameworks
      // like Nestjs (esbuild dont support 'emitDecoratorMetadata' yet)
      tsCompiler: 'esbuild',
    }),
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname)
      }
    ]
  },
  define: {
    'process.env': process.env,
  }
})