// This middleware is used to check if users's token is valid.
// If token is expired, it refreshes and sends back to the client as a response header.
// Client should handle the remaining jobs.
const jwt = require("jsonwebtoken");

const authorization = (req, res, next) => {
  if (!req.token) {
    return res.status(403).send("A token is required for authentication");
  }

  return jwt.verify(req.token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    // if token is not verified:
    if (err) return await refreshToken(req, res, next)

    // pass to the next request
    req.user = decoded;
    req.body.user = decoded.id // for create, update, delete controllers. no need to send user id on client side.
    return next();
  })
};

const refreshToken = async (req, res, next) => {
  // assuming that there is a token in the header
  let error = null

  // fetch original user
  const user = await req.app.db('users').first().where({
    id: jwt.decode(req.token).id, // user.id
    token: req.token,
  })

  if (!user) {
    error = {
      status: 403,
      message: 'User not found'
    }
  }
  else if (!user.refresh) {
    error = {
      status: 401,
      message: 'Refresh token is not valid'
    }
  }
  else if (jwt.decode(user.refresh).id && jwt.decode(req.token).id !== user.id) {
    error = {
      status: 403,
      message: 'Refresh token <-> user mismatch'
    }
  }

  if (error) {
    return res.status(error.status).send(error.message)
  }

  try {
    // verify the refresh token
    jwt.verify(user.refresh, process.env.REFRESH_TOKEN_SECRET)

    // new token
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_LIFE
    })

    // assign the user to the request object
    req.user = user

    // save new token
    await req.app.db('users').update({ token }).where({ id: user.id })

    // set new token in response headers
    res.set('x-access-token', token)

    // set token cookie
    res.cookie('token', token, {
      maxAge: 86400 * 7 * 1000, // 7 days
      httpOnly: true, // http only, prevents JavaScript cookie access
      overwrite: true,
      secure: process.env.NODE_ENV === 'production', // cookie must be sent over https / ssl
      domain: process.env.CLIENT_URL,
      path: '/'
    })

    return next()
  } catch (err) {
    return res.status(401).send('Unauthorized', err.message)
  }
}

module.exports = authorization;