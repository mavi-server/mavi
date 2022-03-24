// Sub Controller for populating relations
// Also can be refered as 'population controller'

const UrlQueryBuilder = require('./url-query-builder')
const SubController = async function (req, { populate, data }) {
  const knex = req.app.db
  const model = req.config.model

  if (Array.isArray(data) == false) {
    data = [data || {}]
  }

  return await Promise.all(data.map(async row => {
    await Promise.all(populate.map(async config => {
      // must
      if (!config.query) config.query = {}

      const {
        select, // column
        from, // table
        columns, // select populated data columns
        on, // referencing to the model table's id column eg: { on: 'user' } will refer [model].id
        on2,// referencing to the model table's specified column eg: {on2: 'type'} will refer [model].[type]
        type /* type will be removed later, controller will be used instead */,
        controller,
        query,
        populate, // recursively populate - deep populate
        returning // "token-reference" option
      } = config
      // * on, on2 are used in the 'where' statements */

      if (controller || type) {
        // convert user's url queries to objects
        // the objects will be used to build sub sql query
        UrlQueryBuilder(query, columns)

        switch (controller || type) {
          case 'count': {
            const queryBuilder = knex(from)

            if (select && on) {
              if (!query.where) query.where = []

              // on:
              query.where.push({ exec: 'where', params: [on, '=', row.id] })

              // on2: (may be removed on the future)
              if (on2) query.where.push({ exec: 'where', params: [on2, '=', model] })

              // is-owner
              if (req.owner) {
                if (model === 'users') query.where.push({ exec: 'where', params: ['id', '=', req.owner.id] })
                else query.where.push({ exec: 'where', params: ['user', '=', req.owner.id] })
              }

              // append where queries
              if (query.where) {
                for (const group of query.where) {
                  queryBuilder[group.exec](...group.params)
                }
              }

              // populate:
              const data = await queryBuilder.count('*').then(res => ({ [select]: Number(res[0].count) }))
              Object.assign(row, data)
            } else {
              const message = "sql-query-populate-relations: `on` & `select` option should be defined"
              console.error(message)
              throw Error({ message })
            }
            break;
          }
          case 'token-reference': {
            const queryBuilder = knex(from)

            if (select) {
              // only users with identity can use this sub controller
              if (req.user && req.user.id) {
                const where = {
                  user: req.user.id, // reference token
                  [on || select]: row.id // referencing column
                }
                if (on2) where[on2] = model

                const reference = await queryBuilder.first(columns).where(where)
                if (reference) {
                  if (returning) {
                    if (returning === '*') row[select] = reference
                    else if (columns.includes(returning)) row[select] = reference[returning]
                  }
                  else row[select] = reference.id || null

                } else row[select] = null
              }
            } else {
              const message = "sql-query-populate-relations: `select` option should be defined"
              console.error(message)
              throw Error({ message })
            }
            break;
          }
          case 'array-reference': {
            if (select && row[select]) {
              try { row[select] = JSON.parse(row[select]) }
              catch (err) { console.error("knex populate [array-reference]:", err.message) }

              if (Array.isArray(row[select])) {
                try {
                  row[select] = await Promise.all(row[select].map(async id => await req.app.db(from).first(columns).where({ id: Number(id) })))
                }
                catch (err) { console.error("knex populate [array-reference]:", err.message) }
              } else row[select] = null
            }
            break;
          }
          case 'object': {
            const queryBuilder = knex(from)

            // if row have an id
            if (select && row[select]) {
              row[select] = await queryBuilder.first(columns).where({ id: row[select] })

              if (populate) { // deep populate
                try {
                  row[select] = await SubController(req, { populate, data: row[select] })
                  if (Array.isArray(row[select])) row[select] = row[select][0]
                } catch (err) {
                  throw err
                }
              }
            }
            break
          }
          case 'array': {
            const queryBuilder = knex(from)

            // if row have an id
            if (select && row[select]) {
              if (query.sort) {
                queryBuilder.orderBy(query.sort)
              }
              if (query.start) {
                queryBuilder.offset(query.start)
              }
              if (query.limit || !query.limit) {
                queryBuilder.limit(query.limit || 10)
              }

              // Handle where queries:
              if (!query.where) query.where = []

              // on:
              query.where.push({ exec: 'where', params: ['id', '=', row[select]] })

              // on2: (may be removed on the future)
              if (on2) query.where.push({ exec: 'where', params: [on2, '=', model] })

              // is-owner
              if (req.owner) {
                if (model === 'users') query.where.push({ exec: 'where', params: ['id', '=', req.owner.id] })
                else query.where.push({ exec: 'where', params: ['user', '=', req.owner.id] })
              }

              // append where queries
              if (query.where) {
                for (const group of query.where) {
                  queryBuilder[group.exec](...group.params)
                }
              }

              // populate selected row:
              row[select] = await queryBuilder.first(columns)
            }

            if (populate) { // deep populate
              try {
                row[select] = await SubController(req, { populate, data: row[select] })
              } catch (err) {
                throw err
              }
            }
            break
          }
          default: break
        }
      }
      else {
        const message = "sql-query-populate-relations: `controller`or `type` option should be defined"
        console.error(message)
        throw Error({ message })
      }

      return true
    }))

    return row
  }))
}

module.exports = SubController