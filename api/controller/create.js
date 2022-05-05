const SubController = require('../services/sub-controller');
const handleControllerError = require('./utils/handle-controller-error');

module.exports = async function (body, populateIt = true) {
  const { populate, columns } = this.req.config;

  // You can send data via parameters or via body.
  if (this.req.params) {
    if (!body) body = {};
    body = { ...body, ...this.req.params };
  }

  if (!body || Object.keys(body).length === 0) {
    return {
      status: 400,
      data: 'Body is required',
    };
  }

  let data = await this.req.queryBuilder
    .insert(body)
    .returning(columns)
    .catch(handleControllerError);

  // populate options
  if (populateIt && data && populate && Array.isArray(populate)) {
    [data] = await SubController(this.req, {
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
