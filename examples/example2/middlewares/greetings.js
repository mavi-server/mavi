module.exports = (req, res, next) => {
  console.log('Hello from middleware!');
  next();
};
