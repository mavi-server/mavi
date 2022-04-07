// To be able to use this.req controller, you need to have users table in your database
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const handleControllerError = require('./utils/handle-controller-error');

/**
 * 
 * @param {{ fullname: string, username: string, avatar: string, email: string, password: string }} body
 */
module.exports = async function (body) {
  // Register logic starts here
  try {
    // Get user input
    const { fullname, username, avatar, email, password } = body;

    // Validate user input
    if (!fullname || !email || !username || !password) {
      return {
        status: 400,
        data: 'Please fill all the fields',
      };
    }

    // check if user already exist
    // Validate if user exist in our database
    const [{ count }] = await this.req.queryBuilder
      .count('*')
      .where({ username })
      .orWhere({ email })
      .catch(handleControllerError); // [ { count: 'number' } ]

    if (Number(count)) {
      return {
        status: 409,
        data: 'Username or email already exist',
      };
    }

    // Encrypt user password
    let encryptedPassword = await bcrypt.hash(password, 10);

    const data = {
      email: email.trim(), // sanitize: convert email to lowercase
      fullname: fullname.trim(), // sanitize: remove white spaces
      username: username.trim(), // sanitize: remove white spaces
      avatar: avatar,
      password: encryptedPassword,
    };

    // Get new user id
    const [user] = await this.req.queryBuilder
      .insert(data)
      .returning([
        'id',
        'email',
        'fullname',
        'username',
        'avatar',
        'token',
        'refresh',
      ])
      .catch(handleControllerError);

    // Create/assign access tokens with *user id*:

    // 1- access token for restricted resources
    const token = await jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_LIFE || '15m', // default 15 minutes
    });

    // 2- refresh token for long term access
    const refresh = await jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_EXPIRE || '30d', // default 30 days
    });

    user.token = token;
    user.refresh = refresh;

    // Update user access tokens:
    await this.req.queryBuilder
      .update({ token, refresh })
      .where({ username })
      .orWhere({ email })
      .catch(handleControllerError);

    // set new token in response header
    this.res.set('x-access-token', token);

    // return new user
    return {
      status: 201,
      data: user,
    };
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.log(err);
    }

    return {
      status: 401,
      data: `Something went wrong`,
    };
  }
  // Register logic ends here
};
