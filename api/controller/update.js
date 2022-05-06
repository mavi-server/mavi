const SubController = require('../services/sub-controller');
const UrlQueryBuilder = require('../services/url-query-builder');
const handleControllerError = require('./utils/handle-controller-error');

module.exports = async function (id, body, populateIt = true) {
  const { model, populate, columns } = this.req.config;
  
  // Url Query Builder:
  const query = UrlQueryBuilder(this.req);

  if (id) {
    // is-owner
    if (this.req.owner) {
      if (model === 'users') {
        id = this.req.owner.id;
      } else {
        query.where.push({
          exec: 'where',
          params: ['user', '=', this.req.owner.id],
        });
      }
    }

    query.where.push({
      exec: 'where',
      params: ['id', '=', id],
    });
  } else {
    return {
      status: 400,
      data: 'Id is required',
    };
  }

  // append where clauses
  for (const group of query.where) {
    this.req.queryBuilder[group.exec](...group.params);
  }

  let [data] = await this.req.queryBuilder
    .update(body)
    .returning(columns)
    .catch(handleControllerError);

  if (!data && this.req.owner) {
    return {
      status: 400,
      data: "You don't have permission for this.req",
    };
  }

  // populate options
  if (populateIt && data && populate && Array.isArray(populate)) {
    data = await SubController(this.req, {
      populate,
      data,
    }).catch(handleControllerError);
  }
  if (Array.isArray(data)) data = data[0] || null;

  return {
    status: 201,
    data,
  };
};