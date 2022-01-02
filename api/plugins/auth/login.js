const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = async (req, res) => {
  req.accepts('application/json')

  // Login logic starts here
  try {
    // Get user input
    const { username, email, password } = req.body

    // Validate user input
    if (!((username || email) && password)) {
      return res.status(400).send("All input is required")
    }

    // Validate if user exist in our database
    const user = await req.app.db('users').first().where(email ? { email } : { username })

    if (user && (await bcrypt.compare(password, user.password))) {
      // token payload
      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        fullname: user.fullname,
      }

      // revive tokens
      const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFE || "2h" })
      const refresh = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_EXPIRE || "30d" })

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

      // save new tokens for consistency
      await req.app.db('users').update({ token, refresh }).where({ id: user.id })

      payload.token = token // access token
      return res.status(200).json(payload)
    }
    return res.status(400).send("Invalid Credentials")
  } catch (err) {
    console.log(err)
    return res.status(500).send("Server error")
  }
  // Register logic ends here
}