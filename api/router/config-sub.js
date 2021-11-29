// * sub/populate config - each fragment(column) can be used for populating relational data or datasets
// * every fragment is like a sub route configuration of main routes

/*
{
  select: alias or real column name
  from: table name
  on: column name
  type: knex-populate.js types: count, token-reference, array-reference, object, array...
  columns: optional | inherits from models. you can overwrite it. this property represents selected columns for the response
  exlude: optional | it exclude from columns array. columns should not be '*' for exclude to be working  
  returning: optional for token-reference. any column. also '*' can be used for returning all. multiple selection is not supported.
}
*/
export default {}