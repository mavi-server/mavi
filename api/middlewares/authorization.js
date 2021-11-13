import jwt from "jsonwebtoken";
const config = process.env;

const authorization = (req, res, next) => {
  const token = req.cookies.token || req.headers["x-access-token"] || req.body.token || req.query.token

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  return jwt.verify(token, config.ACCESS_TOKEN_SECRET, async function (err, decoded) {
    if (err) {
      // if token is not verified
      return res.status(401).send("Unauthorized");
    }

    // pass to the next request
    req.user = decoded;
    req.body.user = decoded.id // for create, update, delete controllers. no need to send user id on client side.

    // if (req.method === 'GET') {
    //   // only return users own datas
    //   if (req.query.where) req.query.andWhere = `user:${req.user.id}` // dont overwrite the existing where query
    //   else req.query.where = `user:${req.user.id}` // assign new where query
    // }
    return next();
  })
};

export default authorization;