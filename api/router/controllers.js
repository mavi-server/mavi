import queryPopulateRelations from '../services/knex-populate.js'
import formidable from 'formidable'

export default (req, res) => {
  const model = req.config.model // data table name
  const queryBuilder = req.app.db(model)
  const { populate, columns, /*exclude*/ /*schema*/ } = req.config
  const { query } = req // request query

  // api config - queries can be defined inside of the config.js
  // this will overwrite existing query properties
  if (req.config.query && typeof req.config.query === 'object') {
    Object.keys(req.config.query).forEach(key => {
      // console.log("req query:", query[key])
      query[key] = req.config.query[key]
    })
  }

  // api config - exclude option can be defined inside of the config.js
  // this will overwrite existing exclude properties
  if (query.exclude) {
    const excludeColumns = query.exclude.split(':')
    columns.forEach((col, i) => {
      // exclude columns
      if (excludeColumns.find(C => col == C)) {
        columns.splice(i, 1)
      }
    })
  }


  // if (req.owner) { // is-owner
  //   queryBuilder.where({ user: req.owner.id })
  // }


  if (!(columns && Array.isArray(columns))) {
    return res.status(500).send('controller.js: req.config.columns should be an array')
  }

  if (Object.keys(query).length) {
    Object.keys(query).forEach(key => {
      switch (key) {
        case 'limit':
          query[key] = Number(query[key])
          break;
        case 'start':
          query[key] = Number(query[key])
          break;
        case 'groupBy':
          query[key] = String(query[key])
          break;
        case 'sort':
          if (typeof query[key] === 'string') {
            const [column, type] = query[key].split(':')
            if (column && type) {
              query[key] = { column: column || 'id', type: type || 'asc' }
            }
          }
          break;
        case 'where':
        case 'orWhere':
        case 'andWhere':
        case 'whereIn':
        case 'whereNotIn':
          // &where=id-lg:2
          // &where=id:1:2:3:4
          // &whereIn=id:1:2:3:4
          // &whereNotIn=id:6:7
          // seperator => '_' or '-'
          if (typeof query[key] === 'string') {
            let operator = '='
            const [column, condition] = query[key].split(':')[0].split(/-|_/)
            let values
            if (key.includes('In')) {
              values = query[key].split(':').map(n => Number(n)).slice(1)
            } else {
              values = query[key].split(':').slice(1)[0]
            }

            switch (condition) {
              case 'not':
              case 'neq':
                operator = '<>'
                break;
              case 'eq':
                operator = '='
                break;
              case 'lg':
                operator = '>'
                break;
              case 'lge':
                operator = '>='
                break;
              case 'sm':
                operator = '<'
                break;
              case 'sme':
                operator = '<='
                break;
            }

            query[key] = key.includes('In') ?
              [column, values] : [column, operator, values]
          }
          break;
      }
    })
    // console.log(query)
  }

  return {
    find: async (populateIt = true) => {
      queryBuilder.select(columns)

      if (query.sort) {
        queryBuilder.orderBy(query.sort.column, query.sort.type)
      }
      if (query.limit) {
        queryBuilder.limit(query.limit)
      } else queryBuilder.limit(10)
      if (query.start) {
        queryBuilder.offset(query.start)
      }
      if (query.groupBy) {
        queryBuilder.groupBy(query.groupBy)
      }
      if (query.where || req.owner) {
        if (req.owner) { // is-owner
          const where = {
            user: req.owner.id
          }
          if (query.where) {
            // convert literal where into object where
            const [column, operator, value] = query.where
            where[column] = value
          }
          queryBuilder.where(where)
        }
        else queryBuilder.where(...query.where)
      }
      if (query.andWhere) {
        queryBuilder.andWhere(...query.andWhere)
      }
      if (query.orWhere) {
        queryBuilder.orWhere(...query.orWhere)
      }
      if (query.whereIn) {
        queryBuilder.whereIn(...query.whereIn)
      }
      if (query.whereNotIn) {
        queryBuilder.whereNotIn(...query.whereNotIn)
      }
      // query & params ends
      // console.log(query)


      let data = await queryBuilder.catch(err => res.status(500).send(err.message))
      // populate options
      if (populateIt && data.length && populate && Array.isArray(populate)) {
        data = await queryPopulateRelations(req, { populate, data }).catch(err => res.status(500).send(err.message))
      }
      res.data = data

      return data
    },
    count: async function () {
      if (query.where || req.owner) {
        if (req.owner) { // is-owner
          const where = {
            user: req.owner.id
          }
          if (query.where) {
            // convert literal where into object where
            const [column, operator, value] = query.where
            where[column] = value
          }
          queryBuilder.where(where)
        }
        else queryBuilder.where(...query.where)
      }

      let [data] = await queryBuilder.count('id').catch(err => res.status(500).send(err.message))
      res.data = data.count = Number(data.count)

      return data.count || 0
    },
    findOne: async function (params, populateIt = true) {
      const where = {}
      const { id, name, username } = params

      if (id) where.id = id
      else if (name) where.name = name
      else if (username) where.username = username
      if (req.owner) where.user = req.owner.id

      queryBuilder.first(columns).where(where)
      let data = await queryBuilder.catch(err => res.status(500).send(err.message))
      // populate options
      if (populateIt && data && populate && Array.isArray(populate)) {
        data = await queryPopulateRelations(req, { populate, data }).catch(err => res.status(500).send(err.message))
      }
      if (Array.isArray(data)) data = data[0] || null
      res.data = data

      if (!data && req.owner) return res.status(400).send("You don't have permission for this")

      return data
    },
    create: async function (body, populateIt = true) {
      let data = await queryBuilder.insert(body).returning(columns).catch(err => res.status(500).send(err.message))
      // populate options
      if (populateIt && data && populate && Array.isArray(populate)) {
        data = await queryPopulateRelations(req, { populate, data }).catch(err => res.status(500).send(err.message))
      }

      if (Array.isArray(data)) data = data[0] || null
      res.data = data

      return data
    },
    update: async function (id, body) {
      const where = {}
      if (id) where.id = id
      if (req.owner) {
        if (model === 'users') {
          where.id = req.owner.id
        } else {
          where.user = req.owner.id
        }
      }

      let data = await queryBuilder.update(body).where(where).returning(columns).catch(err => res.status(500).send(err.message))

      if (!data && req.owner) return res.status(400).send("You don't have permission for this")

      if (Array.isArray(data)) data = data[0] || null
      res.data = data

      return data
    },
    delete: async function (id, populateIt = true) {
      const where = {}
      if (id) where.id = id
      if (req.owner) where.user = req.owner.id

      let [data] = await queryBuilder.del().where(where).returning(columns).catch(err => res.status(500).send(err.message))
      if (!data && req.owner) return res.status(400).send("You don't have permission for this")

      // populate options
      if (populateIt && data && populate && Array.isArray(populate)) {
        data = await queryPopulateRelations(req, { populate, data }).catch(err => res.status(500).send(err.message))
      }


      if (Array.isArray(data)) data = data[0] || null
      res.data = data

      return data
    },
    upload: function (folder, data) {
      if (folder) {
        // access form data files
        const form = new formidable.IncomingForm()
        form.parse(req)
        // start processing
        form.on('fileBegin', function (name, file) {
          file.path = process.cwd() + `/static/uploads/${folder}/` + file.name
        })

        // obtain file
        form.on('file', async function (name, file) {
          // register uploaded file
          if (file) {
            data.url = `/uploads/${folder}/` + file.name
            const [result] = await queryBuilder.insert(data).returning(columns).catch(err => res.status(500).send(err.message))

            return res.status(200).json(result)
          } else {
            console.error('upload controller: `file` not defined')
            return res.status(500).send('upload controller: `file` not defined')
          }
        })
      }
      else {
        console.error('upload controller: please define `folder` parameter')
        return res.status(500).send('upload controller: please define `folder` parameter')
      }

    }
  }
}