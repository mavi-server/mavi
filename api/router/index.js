import express from 'express'
import routes from './config.js'
import hydrateRoutes from './utils/hydrate-routes.js'

const router = express.Router()
const config = hydrateRoutes(routes)

// check this: https://vitejs.dev/guide/features.html#glob-import

import authorization from '../middlewares/authorization.js'
import interceptor from '../middlewares/interceptor.js'
import isOwner from '../middlewares/is-owner.js'

const middlewares = {
  'authorization': authorization,
  'interceptor': interceptor,
  'is-owner': isOwner,
}

import detectLanguage from '../utils/detect-language.js'
import sanitize from '../utils/sanitize.js'

const utils = {
  'detect-language': detectLanguage,
  'sanitize': sanitize,
}

Object.keys(config).forEach(model => {
  const routes = config[model]

  Promise.all(routes.map(async config => {
    if (config.method && !['get', 'post', 'put', 'delete'].includes(config.method)) { res.status(500).send('Invalid request method') }

    return await router[config.method](config.path, ...config.middlewares.map(fn => middlewares[fn]), async (req, res) => {
      // controller settings
      config.model = model
      req.config = config

      // set utils
      await Promise.all(config.utils.map(function (fn) {
        if (utils[fn]) {
          req.body = utils[fn](req.body, config)
        } else console.error('utils function not found:', fn)
        return req.body
      }))


      // params & datas
      const data = req.body
      const { id, folder } = req.params

      // methods
      switch (config.controller) {
        case 'find':
        case 'count':
          await req.app.controllers(req, res)[config.controller]()
          break;
        case 'findOne':
          await req.app.controllers(req, res)[config.controller](req.params)
          break;
        case 'create':
          await req.app.controllers(req, res)[config.controller](data)
          break;
        case 'delete':
          await req.app.controllers(req, res)[config.controller](id)
          break;
        case 'update':
          await req.app.controllers(req, res)[config.controller](id, data)
          break;
        case 'upload':
          return await req.app.controllers(req, res)[config.controller](folder, data)
        default:
          res.send(500)
          break;
      }
      // console.log(res.data)
      return res.status(200).json(res.data)
    })
  }))
})

export default router