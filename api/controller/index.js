module.exports = (req, res) => {
  // Double check the `columns` type before dive in:
  if (!req.config.columns || !Array.isArray(req.config.columns)) {
    return {
      status: 500,
      data: 'Controller: req.config.columns should be an array!',
    };
  }

  // SQL Query Builder:
  // you can pass queryBuilder to the request object
  // and build queries on top of it
  req.queryBuilder = req.queryBuilder || req.app.db(req.config.model);

  return {
    count: require('./count').bind({ req, res }),
    find: require('./find').bind({ req, res }),
    findOne: require('./findOne').bind({ req, res }),
    delete: require('./delete').bind({ req, res }),
    update: require('./update').bind({ req, res }),
    create: require('./create').bind({ req, res }),
    upload: require('./upload').bind({ req, res }),
    register: require('./register').bind({ req, res }),
    login: require('./login').bind({ req, res }),
    logout: require('./logout').bind({ req, res }),
  };
};
