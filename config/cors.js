module.exports = {
  origin: '*',
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ['x-access-token', 'x-refresh-token', 'token'],
};