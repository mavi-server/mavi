// difference from verify-token is: this function intercepts all requests (routes config) and defines req.user, if exists checks for the token
// if token is expired, it refreshes and sends back to the client as a response header. client handles the remaining job.

import jwt from "jsonwebtoken";

const interceptor = async (req, res, next) => {
  const token = req.cookies.token || req.headers["x-access-token"] || req.body.token || req.query.token

  if (!token) {
    req.user = null
    return next()
  }
  return jwt.verify(token, import.meta.env.ACCESS_TOKEN_SECRET, async function (err, decoded) {
    if (err) {
      // if token is not verified
      console.error(err.message, "refreshing token")
      return await refreshToken(req, res, next)
    }

    // pass to the next request
    req.user = decoded;
    return next();
  })
}

const refreshToken = async (req, res, next) => {
  // access token
  const token = req.cookies.token || req.headers["x-access-token"] || req.body.token || req.query.token
  const refresh = req.cookies.refresh || req.headers["x-refresh-token"] || req.body.refresh || req.query.refresh

  const decodedAccess = jwt.decode(token)
  const decodedRefresh = jwt.decode(refresh)

  if (!decodedAccess || !decodedRefresh || decodedRefresh.id !== decodedAccess.id) {
    return res.status(403).send('Forbidden')
  }


  // fetch original user
  const columns = ['id', 'email', 'fullname', 'username', 'avatar', 'refresh']
  const user = await req.app.db('users').first(columns).where({ id: decodedRefresh.id })

  if (!user || !user.refresh || refresh !== user.refresh) {
    return res.status(403).send('Forbidden')
  }

  try {
    // verify the refresh token
    jwt.verify(refresh, import.meta.env.REFRESH_TOKEN_SECRET)

    // crucial
    delete user.refresh

    // new token
    const token = jwt.sign(user, import.meta.env.ACCESS_TOKEN_SECRET, { expiresIn: import.meta.env.ACCESS_TOKEN_LIFE })

    // assign user to the request object
    req.user = user

    // save new token
    await req.app.db('users').update({ token }).where({ id: decodedRefresh.id })

    // set new token in response headers
    res.set('x-access-token', token)

    // set token cookie
    res.cookie('token', token, {
      maxAge: 86400 * 7 * 1000, // 7 days
      httpOnly: true, // http only, prevents JavaScript cookie access
      secure: import.meta.env.MODE === 'production' // cookie must be sent over https / ssl
    })

    return next()
  }
  catch (err) {
    return res.status(401).send('Unauthorized', err.message)
  }
}

export default interceptor;