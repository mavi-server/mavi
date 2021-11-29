import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async (req, res) => {
  req.accepts('application/json')

  // Our login logic starts here
  try {
    // Get user input
    const { username, email, password } = req.body

    // Validate user input
    if (!((username || email) && password)) {
      return res.status(400).send("All input is required")
    }

    // Validate if user exist in our database
    const columns = ['id', 'username', 'email', 'avatar', 'fullname', 'password']
    const user = await req.app.db('users').first(columns).where(email ? { email } : { username })

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        fullname: user.fullname,
        token: null,
        refresh: null,
      }

      // Renew tokens
      const token = jwt.sign(payload, import.meta.env.ACCESS_TOKEN_SECRET, { expiresIn: import.meta.env.ACCESS_TOKEN_LIFE || "2h" })
      const refresh = jwt.sign(payload, import.meta.env.REFRESH_TOKEN_SECRET, { expiresIn: import.meta.env.REFRESH_EXPIRE || "30d" })

      // set token cookie
      res.cookie('token', token, {
        maxAge: 86400 * 7 * 1000, // 7 days
        httpOnly: true, // http only, prevents JavaScript cookie access
        secure: import.meta.env.MODE === 'production' // cookie must be sent over https / ssl
      })

      // save new tokens for security
      payload.token = token
      payload.refresh = refresh
      await req.app.db('users').update({ token, refresh })

      return res.status(200).json(payload)
    }
    return res.status(400).send("Invalid Credentials")
  } catch (err) {
    console.log(err)
    return res.status(500).send("Server error")
  }
  // Our register logic ends here
}