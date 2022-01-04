const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = async (req, res) => {
  req.accepts('application/json')

  // Register logic starts here
  try {
    // Get user input
    const { fullname, username, email, password } = req.body;

    // Validate user input
    if (!(email && username && password && fullname)) {
      return res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await req.app.db('users').first('*').where({ email }).orWhere({ username })

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await req.app.db('users').create({
      username,
      fullname,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
    })

    const payload = {
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      username: user.username,
      avatar: user.avatar
    }

    // Create token
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_LIFE || "2h" })
    const refresh = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_EXPIRE || "30d" })

    // save user token
    user.token = token
    user.refresh = refresh
    await req.app.db('users').update({ token, refresh }).where({ id: user.id })

    // return new user
    return res.status(201).json(payload);
  } catch (err) {
    console.log(err);
  }
  // Register logic ends here
}