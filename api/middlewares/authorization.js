// This middleware is used to check if users's token is valid.
// If token is expired, it refreshes and sends back to the client as a response header.
// Client should handle the remaining jobs.
const jwt = require('jsonwebtoken');
const refreshToken = require('../services/refresh-token')

const authorization = async (req, res, next) => {
  if (!req.token) {
    if (req.user && req.user.token) req.token = req.user.token;
    else return res.status(403).send("Access token is required for authentication");
  }

  
  // Verify the access token
  try {
    const decoded = await jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET);
    
    req.user = decoded;
    req.body.user = decoded.id; // for create, update, delete controllers. no need to send user id on client side.
    return next();
  }

  // Token is not verified
  catch(error) {
    return await refreshToken(req, res, next);
  }
};

module.exports = authorization;