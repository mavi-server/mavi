const populateDatas = async function (req, { populate, data }) {
  const knex = req.app.db

  if (Array.isArray(data) == false) {
    data = [data || {}]
  }

  return await Promise.all(data.map(async row => {
    await Promise.all(populate.map(async config => {
      const { select, on, from, type, columns, populate, returning } = config
      // select: column
      // from: table
      // columns: select populated data columns
      // populate: recursiveley populate - deep populate
      // returning: "token-reference" option

      // subquery fragments should be defined in populate.js:

      if (type) {
        const queryBuilder = type !== 'array-reference' ? knex(from) : null
        /* type: 'array-reference' doesn't need to have 'from' option */

        switch (type) {
          case 'count':
            if (select && on) {
              const data = await queryBuilder.count('id').where({ [on]: row.id }).then(res => ({ [select]: Number(res[0].count) }))
              Object.assign(row, data)
            } else {
              console.error("knex-populate: `on` & `select` option should be defined")
              throw new Error("knex-populate: `on` & `select` option should be defined")
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
              console.error("knex-populate: `select` option should be defined")
              throw new Error("knex-populate: `select` option should be defined")
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
        console.error("knex-populate: `type` option should be defined")
        throw new Error("knex-populate: `type` option should be defined")
      }

      return true
    }))

    return row
  }))
}

export default populateDatas