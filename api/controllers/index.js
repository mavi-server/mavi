const formidable = require('formidable')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const queryPopulateRelations = require('../services/knex-populate')

/*
// Disabled now. Can be optional or completely removed.

const firebase = require('firebase')
require("firebase/firestore");
firebase.initializeApp({
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId
})
const firestore = firebase.firestore()
*/

// this file needs to be separated into pieces.

module.exports = (req, res) => {
  const { query } = req // request query
  const { $config } = req.app // request config
  const { model, populate, columns, view /*exclude*/ /*schema*/ } = req.config

  // knex query builder
  let queryBuilder = req.app.db(model)

  // queries can be defined inside of the "api.routes" config as well
  if (req.config.query && typeof req.config.query === 'object') {
    for (const key in req.config.query) {
      // preconfigured queries will not overwrite the incoming URLs query properties
      if (!query[key]) {
        query[key] = req.config.query[key]
      } else {
        console.log(`[query] "${key}" already exists in the URL query`)
      }
    }
  }

  // "exclude" option can be defined inside of the "api.routes" config
  // this will overwrite the existing "exclude" properties
  if (query.exclude) {
    const excludeColumns = query.exclude.split(':')
    columns.forEach((col, i) => {
      // exclude columns
      if (excludeColumns.find(C => col == C)) {
        columns.splice(i, 1)
      }
    })
  }

  // double check the columns type
  if (!(columns && Array.isArray(columns))) {
    return res.status(500).send('[controller] req.config.columns should be an array')
  }

  // *view feature needs improvements*
  // "views" can be defined inside of the "api.define.view" config
  // this will give the ability to make custom queries
  if (view && $config.api.define && $config.api.define.views) { // if view is defined
    if (!req.params.id) return res.status(500).send('[controller] parameter id is required')
    try {
      req.params.id = Number(req.params.id)
    } catch (err) {
      return res.status(500).send('[controller] parameter id should be a number')
    }

    queryBuilder = req.app.db

    const selectRaw = `(${$config.api.define.views[view](req.app.db, req.params.id).toString()}) as ${view}`
    queryBuilder = queryBuilder.from(queryBuilder.raw(selectRaw))

    // console.log(queryBuilder.toString());
  }

  const handleControllerError = (err) => {
    const { status, /*message,*/ detail, code } = err

    res.error = {
      status: status || 500,
      message: code,
      detail,
      code
    }
    // console.log("err.response:", err)
  }


  // Query builder
  for (const key in query) {
    switch (key) {
      case 'limit': // (number)
      case 'start': // (number)
        query[key] = Number(query[key])
        break;
      case 'sort': // (column|columns, direction, nulls)
        // https://knexjs.org/#Builder-orderBy

        // examples:
        // simple sort: "name-asc"
        // multiple sort: "name-desc:created_at-asc-first:id-desc-last"

        if (typeof query[key] === 'string') {
          const Groups = query[key].split(':')
          query[key] = []

          for (const group of Groups) {
            let [column, order, /*nulls*/] = group.split('-')
            column = column || 'id'
            order = order || 'asc'
            // nulls = nulls || 'last' // not works idk why

            query[key].push({ column, order })
          }
        }
        break;
      case 'where': // (column, operator, value|values)
        // examples:
        // simple where: where=id-1-and-community-eq-1-or-name-like-%test%
        if (typeof query[key] === 'string') {
          const createParameters = group => {
            if (!group || !group.part) return

            let [column, condition, value] = group.part.split('-')
            let operator = '=' // default
            column = column || 'id'
            condition = condition || 'eq'
            value = value || false

            // if condition is not specified, value would be false
            if (!value) {
              value = condition // condition is actually a value
              condition = 'eq' // default condition
            }

            // convert the condition into operator so that knex can understand it
            switch (condition) {
              case 'like':
                operator = 'like'
                break;
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
              default:
                operator = '='
                break;
            }

            return [column, operator, value]
          }
          // split the query into groups
          const reg = /-and-|-or-/g
          const groupCount = query[key].split(reg).length
          const Groups = new Array(groupCount).fill({})

          Groups[0] = {
            exec: 'where',
            part: query[key],
            params: createParameters({ part: query[key] })
          }

          if (groupCount > 1) {
            let i = 1
            const matches = [...query[key].matchAll(reg)]
            for (const match of matches) {
              const conjuctive = match[0].replace(/-/g, '')
              const index = match.index + match[0].length
              const nextIndex = matches[i] ? matches[i].index : undefined

              Groups[i].exec = `${conjuctive}Where`
              Groups[i].part = query[key].slice(index, nextIndex)
              Groups[i].params = createParameters(Groups[i])
              i++
            }

            // update first part
            const firstIndex = matches[0].index
            Groups[0].part = query[key].slice(0, firstIndex)
            Groups[0].params = createParameters(Groups[0])
          }

          query[key] = Groups
          // console.log(query[key])
        }
        break;
      // case 'whereNull': // (column)
      // case 'whereNotNull': // (column)
      // case 'orWhereNull': // (column)
      // case 'orWhereNotNull': // (column)
      //   query[key] = String(query[key])
      //   break;
      // case 'whereIn': // (column|columns, array|callback|builder)
      // case 'orWhereIn': // (column|columns, array|callback|builder)
      // case 'whereNotIn': // (column|columns, array|callback|builder)
      //   // examples:  
      //   // simple whereIn: whereIn=id-1,2,3,4
      //   // whereIn: whereIn=id-6,7:community-eq-1 (meaning is id 6 and 7 & community = 1 is included)

      //   // if (key.includes('In')) {
      //   //   const values = query[key].split(':').map(n => Number(n)).slice(1)
      //   //   query[key] = [column, values]
      //   // }
      //   break;
      // case 'whereLike': // (column, string|builder|raw) case sensitive
      // case 'whereILike': // (column, string|builder|raw) case insensitive
      //   break;
      // case 'whereBetween': // (column, range)
      // case 'orWhereBetween': // (column, range)
      // case 'whereNotBetween': // (column, range)
      // case 'orWhereNotBetween': // (column, range)
      //   break;
    }
  }

  return {
    count: async () => {
      if (query.where || req.owner) {
        if (query.where) for (const group of query.where) {
          queryBuilder[group.exec](...group.params)
        }
        if (req.owner) { // is-owner
          queryBuilder.andWhere({ user: req.owner.id })
        }
      }

      let [data] = await queryBuilder.count('*').catch(handleControllerError)
      data.count = Number(data.count || 0)

      return res.send(data)
    },
    find: async (populateIt = true) => {
      if (!view) queryBuilder.select(columns)

      if (query.sort) {
        queryBuilder.orderBy(query.sort)
      }
      if (query.start) {
        queryBuilder.offset(query.start)
      }
      if (query.limit || !query.limit) {
        queryBuilder.limit(query.limit || 10)
      }
      if (query.where || req.owner) {
        if (query.where) for (const group of query.where) {
          queryBuilder[group.exec](...group.params)
        }
        if (req.owner) { // is-owner
          if (model === 'users') {
            queryBuilder.andWhere({ id: req.owner.id })
          } else {
            queryBuilder.andWhere({ user: req.owner.id })
          }
        }
      }


      let data = await queryBuilder.catch(handleControllerError)
      // populate options
      if (populateIt && data && data.length && populate && Array.isArray(populate)) {
        data = await queryPopulateRelations(req, { populate, data }).catch(handleControllerError)
      }

      return res.send(data)
    },
    findOne: async (populateIt = true) => {
      const where = {}
      let { id, name, username } = req.params

      if (id) where.id = id
      else if (name) {
        name = name.replace(/%20|%|\+|\s|-/g, ' ')
        where.name = name
      } else if (username) where.username = username
      if (req.owner) where.user = req.owner.id

      queryBuilder.first(columns).where(where)
      let data = await queryBuilder.catch(handleControllerError)
      // populate options
      if (populateIt && data && populate && Array.isArray(populate)) {
        data = await queryPopulateRelations(req, { populate, data }).catch(handleControllerError)
      }
      if (Array.isArray(data)) data = data[0] || null

      if (!data && req.owner) return res.status(400).send("You don't have permission for this")

      return res.send(data)
    },
    create: async (body, populateIt = true) => {
      let data = await queryBuilder.insert(body).returning(columns).catch(handleControllerError)
      // populate options
      if (populateIt && data && populate && Array.isArray(populate)) {
        data = await queryPopulateRelations(req, { populate, data }).catch(handleControllerError)
      }

      if (Array.isArray(data)) data = data[0] || null

      // try {
      //   // realtime communication
      //   firestore.collection(model).doc(String(data.id)).set(data)
      // } catch (err) { console.error('firebase - adding recovery collection is failed') }

      return res.send(data)
    },
    update: async (id, body) => {
      const where = {}
      if (id) where.id = id
      if (req.owner) {
        if (model === 'users') {
          where.id = req.owner.id
        } else {
          where.user = req.owner.id
        }
      }

      let data = await queryBuilder.update(body).where(where).returning(columns).catch(handleControllerError)

      if (!data && req.owner) return res.status(400).send("You don't have permission for this")

      if (Array.isArray(data)) data = data[0] || null

      // try {
      //   const id = where.id || where.user

      //   // realtime communication
      //   firestore.collection(model).doc(String(id)).update(data)
      // } catch (err) { console.error('firebase - updating recovery collection is failed') }

      return res.send(data)
    },
    delete: async (id, populateIt = true) => {
      const where = {}
      if (id) where.id = id
      if (req.owner) {
        if (model === 'users') {
          where.id = req.owner.id
        } else {
          where.user = req.owner.id
        }
      }

      let [data] = await queryBuilder.delete().where(where).returning(columns).catch(handleControllerError)
      if (!data && req.owner) return res.status(400).send("You don't have permission for this")

      // populate options
      if (populateIt && data && populate && Array.isArray(populate)) {
        data = await queryPopulateRelations(req, { populate, data }).catch(handleControllerError)
      }


      if (Array.isArray(data)) data = data[0] || null

      // try {
      //   // realtime communication
      //   firestore.collection(model).doc(String(data.id)).delete()
      // } catch (err) { console.error('firebase - deleting from recovery collection is failed') }

      return res.send(data)
    },
    upload: async (folder, data) => {
      if (folder) {
        console.log("folder", folder)

        // access form data files
        const form = new formidable.IncomingForm()

        // start processing
        form.parse(req)

        // listen process
        form.on('fileBegin', function (name, file) {
          file.path = process.cwd() + `/uploads/${folder}/` + file.name
        })

        // obtain file
        form.on('file', async function (name, file) {
          // register uploaded file
          if (file) {
            data.url = `/uploads/${folder}/` + file.name
            const [result] = await queryBuilder.insert(data).returning(columns).catch(handleControllerError)

            // try {
            //   // realtime communication
            //   firestore.collection('uploads').doc(result.id).set(result)
            // } catch (err) { console.error('firebase - recovering collection is failed') }

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
    },
    register: async (req, res) => {
      // Register logic starts here
      try {
        // Get user input
        const { fullname, username, email, password } = req.body;

        // Validate user input
        if (!(email && username && password && fullname)) {
          return res.status(400).send("Missing required fields");
        }

        // check if user already exist
        // Validate if user exist in our database
        const oldUser = await req.app.db(model).first('*').where({ email }).orWhere({ username })

        if (oldUser) {
          return res.status(409).send("User Already Exist. Please try another email or username.");
        }

        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);

        // Create user in our database
        const user = await req.app.db(model).insert({
          username,
          fullname,
          email: email.toLowerCase(), // sanitize: convert email to lowercase
          password: encryptedPassword,
        })

        const payload = {
          id: user.id,
          email: user.email,
          fullname: user.fullname,
          username: user.username,
          avatar: user.avatar
        }

        // Create token
        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFE || "2h" })
        const refresh = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_EXPIRE || "30d" })

        // save user token
        user.token = token
        user.refresh = refresh
        await req.app.db(model).update({ token, refresh }).where({ id: user.id }).catch(err => null)

        // return new user
        return res.status(201).json(payload);
      } catch (err) {
        return res.status(401).send(`Something went wrong: ${err}`);
      }
      // Register logic ends here
    },
    login: async (req, res) => {
      // Login logic starts here
      try {
        // Get user input
        const { username, email, password } = req.body

        // Validate user input
        if (!((username || email) && password)) {
          return res.status(400).send("All input is required")
        }

        // Validate if user exist in our database
        const user = await req.app.db(model).first().where(email ? { email } : { username })

        if (user && (await bcrypt.compare(password, user.password))) {
          // token payload
          const payload = {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            fullname: user.fullname,
          }

          // revive tokens
          const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFE || "2h" })
          const refresh = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_EXPIRE || "30d" })

          // set new token in response headers
          res.set('x-access-token', token)

          // set token cookie
          res.cookie('token', token, {
            maxAge: 86400 * 7 * 1000, // 7 days
            httpOnly: true, // http only, prevents JavaScript cookie access
            overwrite: true,
            secure: process.env.NODE_ENV === 'production', // cookie must be sent over https / ssl
            domain: process.env.CLIENT_URL,
            path: '/'
          })

          // save new tokens for consistency
          await req.app.db(model).update({ token, refresh }).where({ id: user.id })

          payload.token = token // access token
          return res.status(200).json(payload)
        }
        return res.status(400).send("Invalid Credentials")
      } catch (err) {
        console.log(err)
        return res.status(500).send("Server error")
      }
      // Register logic ends here
    },
    logout: (req, res) => {
      res.set('x-access-token', null)
      res.clearCookie('token')

      res.status(200).send("User cookie removed")
    }
  }
}