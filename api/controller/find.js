const SubController = require('../services/sub-controller');
const UrlQueryBuilder = require('../services/url-query-builder');
const handleControllerError = require('./utils/handle-controller-error');

module.exports = async function(populateIt = true) {
  const { model, populate, columns } = this.req.config;
    
  // Url Query Builder:
  const query = UrlQueryBuilder(this.req);

  // select if there is no predefined query builder
  // *some query builders can have their own select if you defined them in middlewares
  if(this.req.isQueryBuilderDefined === false) {
    this.req.queryBuilder.select(columns);
  }

  if (query.sort) {
    this.req.queryBuilder.orderBy(query.sort);
  }
  if (query.start) {
    this.req.queryBuilder.offset(query.start);
  }
  if (query.limit || !query.limit) {
    this.req.queryBuilder.limit(query.limit || 10);
  }

  // is-owner
  if (this.req.owner) {
    if (model === 'users') {
      query.where.push({
        exec: 'where',
        params: ['id', '=', this.req.owner.id],
      });
    } else
      query.where.push({
        exec: 'where',
        params: ['user', '=', this.req.owner.id],
      });
  }

  // append where clauses
  for (const group of query.where) {
    this.req.queryBuilder[group.exec](...group.params);
  }

  let data = await this.req.queryBuilder.catch(handleControllerError);

  // populate options
  if (
    populateIt &&
      data &&
      data.length &&
      populate &&
      Array.isArray(populate)
  ) {
    data = await SubController(this.req, {
      populate,
      data,
    }).catch(handleControllerError);
  }

  return {
    status: 200,
    data,
  };
};