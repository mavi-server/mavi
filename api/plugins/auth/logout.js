module.exports = (req, res) => {
  res.set('x-access-token', null)
  res.clearCookie('token')

  res.status(200).send("User cookie removed")
}