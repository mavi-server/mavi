const jwt = require('jsonwebtoken');
const refreshToken = async (req, res, next) => {
  // Assuming that req.token is defined
  // Get refresh token:
  req.refresh =
    req.cookies.refresh ||
    req.headers['x-refresh-token'] ||
    req.body.refresh ||
    req.query.refresh;

  if (!req.refresh) {
    return res.status(401).send('Please login again'); // Refresh token is required for authentication
  }

  // fetch original user
  const user = await req.app
    .db('users')
    .first()
    .where({
      id: jwt.decode(req.refresh).id, // user.id
      refresh: req.refresh, // should be same refesh token as in the header/cookie
    });

  let error = null;

  if (!user) {
    error = {
      status: 401,
      message: 'Invalid access token', // Unauthorized: User not found
    };
  } else if (!user.refresh) {
    error = {
      status: 401,
      message: 'Please login again.', // Unauthorized: Refresh token is not valid.
    };
  } else if (jwt.decode(user.refresh).id !== jwt.decode(user.token).id) {
    error = {
      status: 403,
      message: 'Something is not right X﹏X', // Forbidden: Refresh token mismatch.
    };
  }

  if (error) {
    return res.status(error.status).send(error.message);
  }

  try {
    // verify the refresh token
    jwt.verify(user.refresh, process.env.REFRESH_TOKEN_SECRET);

    // token payload
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      fullname: user.fullname,
    };

    // sign new access token
    const token = jwt.sign({ ...payload }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_LIFE,
    });

    // set new token in response header
    res.set('x-access-token', token);

    // save new token
    await req.app.db('users').update({ token }).where({ id: user.id });

    // assign the user to the request object
    req.user = user;

    return next();
  } catch (err) {
    // Unauthorized: Refresh token is not valid
    return res.status(401).send('Please login again.');
  }
};

module.exports = refreshToken;
