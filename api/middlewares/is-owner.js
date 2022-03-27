// Protects the user entity from being accessed by other users.
// Only works with 'user' column with an id
// Works with: find, findOne, update, delete controllers
const jwt = require('jsonwebtoken');

const verifyTokenAndSetOwner = (req, res, next) => {
  if (!req.token) {
    if (req.user && req.user.token) req.token = req.user.token;
    else return res.status(401).send("Unauthorized: A token is required for authentication");
  }

  return jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, async function (err, decoded) {
    // if token is not verified
    if (err) return res.status(403).send("Forbidden: You have no permission to access this resource");

    // pass to the next request
    req.user = decoded;
    req.owner = decoded;
    req.body.user = decoded.id; // for create, update, delete controllers. no need to send user id on client side.
    return next();
  });

};

module.exports = verifyTokenAndSetOwner;