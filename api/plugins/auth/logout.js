export default (req, res) => {
  res.clearCookie('token')

  res.status(200).send("User cookie removed")
}