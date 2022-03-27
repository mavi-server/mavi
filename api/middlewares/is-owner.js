// Protects the user entity from being accessed by other users.
// Only works with 'user' column with an id
// Works with: find, findOne, update, delete controllers
const jwt = require('jsonwebtoken');
const refreshToken = require('../services/refresh-token');

const verifyTokenAndSetOwner = async (req, res, next) => {
  if (!req.token) {
    if (req.user && req.user.token) req.token = req.user.token;
    else return res.status(401).send("Unauthorized: A token is required for authentication");
  }

  // Verify the access token
  try {
    const decoded = jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET);

    req.user = decoded;
    req.owner = decoded; // the owner should be the same user who is requested an access
    req.body.user = decoded.id; // for create, update, delete controllers. no need to send user id on client side.
    return next();
  }

  // Token is not verified
  catch (error) {
    return await refreshToken(req, res, next);
  }
};

module.exports = verifyTokenAndSetOwner;