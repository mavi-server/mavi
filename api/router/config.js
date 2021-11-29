// req.config
/*
{
  path: required | string
  method: required | post, get, path, put, delete, all
  controller: required | find, findOne, create, update, delete
  middleware: required | interceptor, authorization, is-owner... all in routes.js middleware   object
  columns: optional | inherits from models. you can overwrite it. this property represents selected columns for the response
  exlude: optional | it exclude from columns array. columns should not be '*' for exclude to be working  
}
*/
export default {}
