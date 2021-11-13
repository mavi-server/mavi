// protects user data
// only works with 'user column' with an id
// works with: find, findOne, update, delete
import jwt from 'jsonwebtoken'
const config = process.env;

const verifyTokenAndSetOwner = (req, res, next) => {
  const token = req.cookies.token || req.headers["x-access-token"] || req.body.token || req.query.token

  if (!token) {
    return res.status(403).send("A token is required for authentication")
  }
  return jwt.verify(token, config.ACCESS_TOKEN_SECRET, async function (err, decoded) {
    if (err) {
      // if token is not verified
      return res.status(401).send("Unauthorized");
    }

    // pass to the next request
    req.user = decoded
    req.owner = decoded
    req.body.user = decoded.id // for create, update, delete controllers. no need to send user id on client side.
    return next()
  })

}

export default verifyTokenAndSetOwner;