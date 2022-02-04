const populateDatas = async function (req, { populate, data }) {
  const knex = req.app.db
  const model = req.config.model

  if (Array.isArray(data) == false) {
    data = [data || {}]
  }

  return await Promise.all(data.map(async row => {
    await Promise.all(populate.map(async config => {
      const { select, on, on2, from, type, columns, populate, returning } = config
      // select: column
      // from: table
      // columns: select populated data columns
      // populate: recursiveley populate - deep populate
      // returning: "token-reference" option

      // subquery fragments should be defined in config-sub.js

      if (type) {
        const queryBuilder = type !== 'array-reference' ? knex(from) : null
        /* type: 'array-reference' doesn't need to have 'from' option */

        switch (type) {
          case 'count':
            if (select && on) {
              const where = {
                [on]: row.id,
              }
              if (on2) where[on2] = model

              const data = await queryBuilder.count('*').where(where).then(res => ({ [select]: Number(res[0].count) }))
              Object.assign(row, data)
            } else {
              const message = "knex-populate: `on` & `select` option should be defined"
              console.error(message)
              throw Error({ message })
            }
            break;
          case 'token-reference':
            if (select) {
              // only users with identity can use this type of population
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
              const message = "knex-populate: `select` option should be defined"
              console.error(message)
              throw Error({ message })
            }
            break;
          case 'array-reference':
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
          case 'object':
            // if row have an id
            if (select && row[select]) {
              row[select] = await queryBuilder.first(columns).where({ id: row[select] })

              if (populate) { // deep populate
                try {
                  row[select] = await populateDatas(req, { populate, data: row[select] })
                  if (Array.isArray(row[select])) row[select] = row[select][0]
                } catch (err) {
                  throw err
                }
              }
            }
            break
          case 'array':
            // if row have an id
            if (select && row[select]) {
              row[select] = await queryBuilder.first(columns).where({ id: row[select] })
            }

            if (populate) { // deep populate
              try {
                row[select] = await populateDatas(req, { populate, data: row[select] })
              } catch (err) {
                throw err
              }
            }
            break
          default:
            break
        }
      }
      else {
        const message = "knex-populate: `type` option should be defined"
        console.error(message)
        throw Error({ message })
      }

      return true
    }))

    return row
  }))
}

module.exports = populateDatas