const { IncomingForm } = require('formidable');
const { v4: uuidv4 } = require('uuid');
const { existsSync, mkdirSync } = require('fs');
const { join } = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UrlQueryBuilder = require('../services/url-query-builder');
const SubController = require('../services/sub-controller');

// this file needs to be separated into pieces.

module.exports = (req, res) => {
  const { query } = req; // request query
  const { $config, db } = req.app; // request config
  const { model, populate, columns, view, controller /* schema, exclude*/ } =
    req.config;
  const handleControllerError = err => {
    // Common error handler
    const { status, message, detail, code } = err;

    if (process.env.NODE_ENV === 'development') {
      console.log('err.response:', err);
    }
    throw {
      status: status || 500,
      data: {
        message: `${code}: ${message}`,
        detail,
        code,
      },
    };
  };

  // Double check the `columns` type before dive in:
  if (!Array.isArray(columns)) {
    return {
      status: 500,
      data: 'Controller: req.config.columns should be an array!',
    };
  }

  // SQL Query Builder:
  // you can pass queryBuilder to the request object
  // and build queries on top of it
  let queryBuilder = req.queryBuilder || db(model);

  // Req Query builder
  // If req.config.query is set to 'off', then req.query will not be used at all
  if (req.config.query !== 'off') {
    // Check if there is a pre-configured query
    // Pre-configured queries can be defined inside of the "api.routes"
    // All pre-configured queries should be strings
    if (req.config.query && typeof req.config.query === 'object') {
      // example 1:
      /*
        ..
        controler..
        query: {
          where: 'title-neq-null',  // overwritten to req.query url
          limit: 10,                // overwritten to req.query url
          sort: 'title-asc',        // overwritten to req.query url
          start: 'off',             // restricted query
          exclude: 'off',           // restricted query
        },
        populate..
        ..
      */

      // example 2:
      /* 
        controler..
        query: 'off', // restrict all the queries
        populate..
      */

      for (const key in req.config.query) {
        // Query keys can be restricted as well

        // Overwrite if its not restricted
        if (req.config.query[key] !== 'off') {
          // This will overwrite the req.query:
          query[key] = req.config.query[key];
        }
        // Remove if its restricted
        else {
          // This query will not be used in the SQL queries
          delete query[key];
        }
      }
    }

    // Builder:
    UrlQueryBuilder(query, columns);

    // assign special variables to the query
    if (query.where) {
      for(const w of query.where) {
        if (w.params[2] && w.params[2].startsWith('#')) {
          // get variable string
          const variable = w.params[2].slice(1);
          
          // don't allow to use if special variable is not in the req.params
          if(!(variable in req.params)) {
            throw new Error('Missing parameter: ' + variable);
          }

          // replace the variable with the value from the req.params
          w.params[2] = req.params[variable];
        }
      }
    }
  }
  // If req.config.query is set to 'off', then req.query will not be used at all
  else {
    // Destroyer:
    for (const key in query) {
      query[key] = false;
    }
  }
  // *
  // *view feature needs improvements*
  // "views" can be defined inside of the "api.define.view" config
  // this will give the ability to make custom queries
  // they are not intended to replace the actual view of the RDBMS (for now)
  // *
  if (
    view &&
    $config.api.define &&
    $config.api.define.views &&
    typeof $config.api.define.views === 'object'
  ) {
    // if view is defined
    // queryBuilder = db

    // Be sure id parameter is number
    if (req.params.id) {
      req.params.id = Number(req.params.id);
    }
    // Other params are not checked
    // a view function is gets `knex` and `params` as arguments

    // Expecting to return knex object
    // On some url queries you may need to refer your columns with alias_table_name.column_name
    // (e.g. ?where=id=users.id)
    queryBuilder = $config.api.define.views[view](db, req.params);

    // If not, assume that view function is an sql query:
    if (typeof queryBuilder === 'string' || controller === 'count') {
      // String sql views have some obstacles.
      // Some url queries may not be supported.
      // Like where, orderBy, etc.

      // wrap the query string and convert into knex object
      const sql = `(${queryBuilder}) as ${view}`;
      queryBuilder = db.from(db.raw(sql));
    }

    // console.log(queryBuilder.toString());

    // if there is no controller defined, then use the default view controller
    // if (!controller) {
    //   return async (populateIt = true) => {
    //     let data = await queryBuilder.catch(handleControllerError)
    //     // populate options
    //     if (populateIt && data && data.length && populate && Array.isArray(populate)) {
    //       data = await SubController(req, { populate, data, context: model }).catch(handleControllerError)
    //     }
    // return {
    //   status: 200,
    //   data,
    // };
    //   }
    // }
  }

  return {
    count: async () => {
      // handle where clause
      if (!query.where) query.where = [];

      // is-owner
      if (req.owner) {
        if (model === 'users')
          query.where.push({ exec: 'where', params: ['id', '=', req.owner.id] });
        else
          query.where.push({
            exec: 'where',
            params: ['user', '=', req.owner.id],
          });
      }

      // append where queries
      if (query.where) {
        for (const group of query.where) {
          queryBuilder[group.exec](...group.params);
        }
      }

      let [data] = await queryBuilder.count('*').catch(handleControllerError);
      data.count = Number(data.count || 0);

      return {
        status: 200,
        data,
      };
    },
    find: async (populateIt = true) => {
      if (!view && !Boolean(req.queryBuilder)) queryBuilder.select(columns);

      if (query.sort) {
        queryBuilder.orderBy(query.sort);
      }
      if (query.start) {
        queryBuilder.offset(query.start);
      }
      if (query.limit || !query.limit) {
        queryBuilder.limit(query.limit || 10);
      }
      // handle where clause
      if (!query.where) query.where = [];

      // is-owner
      if (req.owner) {
        if (model === 'users')
          query.where.push({ exec: 'where', params: ['id', '=', req.owner.id] });
        else
          query.where.push({
            exec: 'where',
            params: ['user', '=', req.owner.id],
          });
      }

      // append where clauses
      if (query.where) {
        for (const group of query.where) {
          queryBuilder[group.exec](...group.params);
        }
      }

      let data = await queryBuilder.catch(handleControllerError);
      // populate options
      if (
        populateIt &&
        data &&
        data.length &&
        populate &&
        Array.isArray(populate)
      ) {
        data = await SubController(req, {
          populate,
          data,
          context: model,
        }).catch(handleControllerError);
      }

      return {
        status: 200,
        data,
      };
    },
    findOne: async (populateIt = true) => {
      const where = {};
      let { id, name, username } = req.params;

      if (id) where.id = id;
      else if (name) {
        name = name.replace(/%20|%|\+|\s|-/g, ' ');
        where.name = name;
      } else if (username) where.username = username;
      if (req.owner) where.user = req.owner.id;

      queryBuilder.first(columns).where(where);
      let data = await queryBuilder.catch(handleControllerError);
      // populate options
      if (populateIt && data && populate && Array.isArray(populate)) {
        data = await SubController(req, {
          populate,
          data,
          context: model,
        }).catch(handleControllerError);
      }
      if (Array.isArray(data)) data = data[0] || null;

      if (!data && req.owner) {
        return {
          status: 400,
          data: "You don't have permission for this",
        };
      }

      return {
        status: 200,
        data,
      };
    },
    create: async (body, populateIt = true) => {
      // You can send data via parameters or via body.

      // Where clause for `create` controller. Used to set body fields.
      if(!body || Object.keys(body).length === 0) {
        // Where queries can be used to set body.
        // Special variable string should be defined in the `req.params` object
        // Special variable Values can be set in the `req.params` object
        // example: /:id/:type => where: 'title-#id-and-content_type-#type'
        if(query.where) {
          body = {};
          const specialWhereForCreate = query.where.filter(w=>w.params[2].startsWith('#'));

          if(specialWhereForCreate.length) {
            for(const w of specialWhereForCreate) {
              const $var = w.params[2].slice(1);
              body[$var] = req.params[$var] || null;
            }
          } else {
            return {
              status: 400,
              data: 'Body is required',
            };
          }
        }
      }

      console.log(body);

      let data = await queryBuilder
        .insert(body)
        .returning(columns)
        .catch(handleControllerError);
        
      // populate options
      if (populateIt && data && populate && Array.isArray(populate)) {
        data = await SubController(req, {
          populate,
          data,
          context: model,
        }).catch(handleControllerError);
      }
      if (Array.isArray(data)) data = data[0] || null;

      return {
        status: 201,
        data,
      };
    },
    update: async (id, body, populateIt=true) => {
      const where = {};
      if (id) where.id = id;
      if (req.owner) {
        if (model === 'users') {
          where.id = req.owner.id;
        } else {
          where.user = req.owner.id;
        }
      }

      let [data] = await queryBuilder
        .update(body)
        .where(where)
        .returning(columns)
        .catch(handleControllerError);
      
      if (!data && req.owner) {
        return {
          status: 400,
          data: "You don't have permission for this",
        };
      }

      // populate options
      if (populateIt && data && populate && Array.isArray(populate)) {
        [data] = await SubController(req, {
          populate,
          data,
          context: model,
        }).catch(handleControllerError);
      }
      if(Array.isArray(data)) data = data[0] || null;

      return {
        status: 201,
        data,
      };
    },
    delete: async (id, populateIt = true) => {
      const where = {};
      if (id) where.id = id;
      if (req.owner) {
        if (model === 'users') {
          where.id = req.owner.id;
        } else {
          where.user = req.owner.id;
        }
      }

      let [data] = await queryBuilder
        .delete()
        .where(where)
        .returning(columns)
        .catch(handleControllerError);
      
      if (!data && req.owner) {
        return {
          status: 405, // method not allowed
          data: "You don't have permission for this",
        };
      }

      // populate options
      if (populateIt && data && populate && Array.isArray(populate)) {
        data = await SubController(req, {
          populate,
          data,
          context: model,
        }).catch(handleControllerError);
      }
      if (Array.isArray(data)) data = data[0] || null;

      return {
        status: 200,
        data,
      };
    },
    upload: async (childFolder, data) => {
      if (childFolder) {
        // if controller has default options:
        // check childFolder has a permission to be used
        if (req.config.options && req.config.options.folders) {
          if (!req.config.options.folders.includes(childFolder)) {
            return {
              status: 400,
              data: "You don't have permission for this",
            };
          }
        }
        const options = req.config.options || {};

        // default options:
        const $options = {
          multiples: false,
          keepExtensions: true,
          uploadDir: join(process.cwd(), `/uploads/${childFolder}/`),
          maxFileSize: 5242880, // bytes = 5mb
          allowEmptyFiles: false,
          filter: function ({ name, originalFilename, mimetype }) {
            // keep only accepted mime types
            const accept = (options && options.accept) || 'image'; // default: image
            return mimetype && mimetype.includes(accept);
          },
          filename: function (name, ext, file) {
            // generate a unique filename
            return uuidv4() + ext;
          },
          ...options, // overwrite default options
        };

        // create child directory if not exists
        if (!existsSync($options.uploadDir)) {
          mkdirSync($options.uploadDir);
        }

        // access form data files
        const form = new IncomingForm($options);

        // start processing
        form.parse(req);
        form.on('file', async function (formname, file) {
          // register uploaded file
          if (file) {
            const filePath = `/uploads/${childFolder}/` + file.newFilename;

            if (req.user) {
              data.user = req.user.id;
            }

            data.id = Number((Math.random() * 10000).toFixed());
            data.url = filePath;
            data.alt =
              req.body.alt ||
              file.originalFilename.split('.').shift().replace(/-/g, ' ');

            if (!model || !columns) {
              return {
                status: 200,
                data,
              };
            } else {
              const [result] = await queryBuilder
                .insert(data)
                .returning(columns)
                .catch(handleControllerError);

              return {
                status: 201,
                data: result,
              };
            }
          } else {
            console.error('upload controller: `file` not defined');
            return {
              status: 400,
              data: 'upload controller: `file` not defined',
            };
          }
        });
        form.on('error', function (err) {
          return {
            status: 400,
            data: 'upload controller: ' + err,
          };
        });
      } else {
        return {
          status: 400,
          data: 'upload controller: `childFolder` not defined',
        };
      }
    },
    /**
     * To be able to use this controller, you need to have users table in your database
     */
    register: async (req, res) => {
      // Register logic starts here
      try {
        // Get user input
        const { fullname, username, avatar, email, password } = req.body;

        // Validate user input
        if (!fullname || !email || !username || !password) {
          return {
            status: 400,
            data: 'Please fill all the fields',
          };
        }

        // check if user already exist
        // Validate if user exist in our database
        const [{ count }] = await queryBuilder
          .count('*')
          .where({ username })
          .orWhere({ email })
          .catch(handleControllerError); // [ { count: 'number' } ]

        if (Number(count)) {
          return {
            status: 409,
            data: 'Username or email already exist',
          };
        }

        // Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);

        const data = {
          email: email.toLowerCase(), // sanitize: convert email to lowercase
          fullname: fullname.trim(), // sanitize: remove white spaces
          username: username.trim(), // sanitize: remove white spaces
          avatar: avatar,
          password: encryptedPassword,
        };

        // Get new user id
        const [user] = await queryBuilder
          .insert(data)
          .returning([
            'id',
            'email',
            'fullname',
            'username',
            'avatar',
            'token',
            'refresh',
          ])
          .catch(handleControllerError);

        // Create/assign access tokens with *user id*:

        // 1- access token for restricted resources
        const token = await jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: process.env.ACCESS_TOKEN_LIFE || '2h',
        });

        // 2- refresh token for long term access
        const refresh = await jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
          expiresIn: process.env.REFRESH_EXPIRE || '30d',
        });

        user.token = token;
        user.refresh = refresh;

        // Update user access tokens:
        await queryBuilder
          .update({ token, refresh })
          .where({ username })
          .orWhere({ email })
          .catch(handleControllerError);

        // set new token in response header
        res.set('x-access-token', token);

        // return new user
        return {
          status: 201,
          data: user,
        };
      } catch (err) {
        return {
          status: 401,
          data: `Something went wrong: ${err}`,
        };
      }
      // Register logic ends here
    },
    /**
     * To be able to use this controller, you need to have users table in your database
     */
    login: async (req, res) => {
      // Login logic starts here
      try {
        // Get user input
        const { username, email, password } = req.body;

        // Validate user input
        if (!(username || email) || !password) {
          return {
            status: 400,
            data: 'All input is required',
          };
        }

        // Validate if user exist in our database
        const user = await queryBuilder
          .first()
          .where(email ? { email } : { username })
          .catch(handleControllerError);

        if (user && (await bcrypt.compare(password, user.password))) {
          // token payload
          const payload = {
            id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            fullname: user.fullname,
          };

          // Revive tokens:
          const token = jwt.sign(
            { ...payload },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: process.env.ACCESS_TOKEN_LIFE || '2h',
            }
          );
          const refresh = jwt.sign(
            { ...payload },
            process.env.REFRESH_TOKEN_SECRET,
            {
              expiresIn: process.env.REFRESH_EXPIRE || '30d',
            }
          );

          // set new token in response header
          res.set('x-access-token', token);

          // save new tokens for consistency/security
          await queryBuilder.update({ token, refresh }).where({ id: user.id });

          // assign access required tokens for the response
          payload.token = token; // access
          payload.refresh = refresh; // refresh

          // return signed user
          return {
            status: 200,
            data: payload,
          };
        }
        return {
          status: 400,
          data: 'Invalid Credentials',
        };
      } catch (err) {
        return {
          status: 401,
          data: `Something went wrong: ${err}`,
        };
      }
      // Register logic ends here
    },
    logout: (req, res) => {
      res.set('x-access-token', null);
      res.set('x-refresh-token', null);
      res.clearCookie('token');

      return {
        status: 200,
        data: 'User cookie removed',
      };
    },
  };
};
