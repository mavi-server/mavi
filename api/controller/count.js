const UrlQueryBuilder = require('../services/url-query-builder');
const handleControllerError = require('./utils/handle-controller-error');

module.exports = async function () {
  const { model } = this.req.config;

  // Url Query Builder:
  const query = UrlQueryBuilder(this.req);

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

  let [data] = await this.req.queryBuilder.count('*').catch(handleControllerError);
  data.count = Number(data.count || 0);

  return {
    status: 200,
    data,
  };
};