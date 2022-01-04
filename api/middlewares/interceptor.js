// This function intercepts all the requests.
// Used as a default middleware for every route.

const jwt = require("jsonwebtoken");

// every request uses this middleware.
const interceptor = async (req, res, next) => {
  req.token = req.cookies.token || req.headers["x-access-token"] || req.body.token || req.query.token

  if (!req.token) {
    req.user = null
  } else {
    req.user = jwt.decode(req.token)
  }

  return next()
}

module.exports = interceptor;
