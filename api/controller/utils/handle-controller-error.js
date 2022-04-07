module.exports = err => {
  // Common error handler
  const { status, message, detail, code } = err;
  
  if (process.env.NODE_ENV === 'development') {
    console.log('err.response:', err);
  }
  throw {
    status: status || 500,
    data: {
      message: `${code}: ${message}`,
      detail,
      code,
    },
  };
};