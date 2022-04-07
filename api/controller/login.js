// To be able to use this controller, you need to have users table in your database
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const handleControllerError = require('./utils/handle-controller-error');

/**
 * 
 * @param {{ username: string, email: string, password: string }} body
 */
module.exports = async function (body) {
  // Login logic starts here
  try {
    // Get user input
    const { username, email, password } = body;

    // Validate user input
    if (!(username || email) || !password) {
      return {
        status: 400,
        data: 'All input is required',
      };
    }

    // Validate if user exist in our database
    const user = await this.req.queryBuilder
      .first()
      .where(email ? { email } : { username })
      .catch(handleControllerError);

    if (user && (await bcrypt.compare(password, user.password))) {
      // token payload
      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        fullname: user.fullname,
      };

      // Revive tokens:
      const token = jwt.sign({ ...payload }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_LIFE || '2h',
      });
      const refresh = jwt.sign(
        { ...payload },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: process.env.REFRESH_EXPIRE || '30d',
        }
      );

      // set new token in response header
      this.res.set('x-access-token', token);

      // save new tokens for consistency/security
      await this.req.queryBuilder.update({ token, refresh }).where({ id: user.id });

      // assign access required tokens for the response
      payload.token = token; // access
      payload.refresh = refresh; // refresh

      // return signed user
      return {
        status: 200,
        data: payload,
      };
    }
    return {
      status: 400,
      data: 'Invalid Credentials',
    };
  } catch (err) {
    return {
      status: 401,
      data: `Something went wrong: ${err}`,
    };
  }
  // Register logic ends here
};
