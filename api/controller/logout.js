module.exports = async function () {
  this.res.set('x-access-token', null);
  this.res.set('x-refresh-token', null);
  this.res.clearCookie('token');

  return {
    status: 200,
    data: 'User cookie removed',
  };
};
