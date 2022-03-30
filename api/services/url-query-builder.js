/**
 * @type {(query: any[], columns: any[], payload: { row: any, context: string, params: object }) => any}
 * @description $query should not mutated directly. Instead allocate a new array and return it.
 */
const UrlQueryBuilder = async (query, columns, { context, params, row }) => {
  if (!query || query === 'off') return query = {};

  // build the url query
  for (const key in query) {
    // query is deactivated
    if (query[key] === 'off') continue;

    switch (key) {
      case 'limit': // (number)
      case 'start': // (number)
        query[key] = Number(query[key]);
        break;
      case 'sort': // (column|columns, direction, nulls)
        // https://knexjs.org/#Builder-orderBy

        // examples:
        // simple sort: "name-asc"
        // multiple sort: "name-desc:created_at-asc-first:id-desc-last"

        if (typeof query[key] === 'string') {
          const Groups = query[key].split(':');
          query[key] = [];

          for (const group of Groups) {
            let [column, order] = group.split('-');
            column = column || 'id';
            order = order || 'asc';
            // nulls = nulls || 'last' // not works idk why

            query[key].push({ column, order });
          }
        }
        break;
      case 'where': // (column, operator, value|values)
        // examples:
        // simple where: where=id-1-and-community-eq-1-or-name-like-%test%
        if (typeof query[key] === 'string') {
          // split the query into groups
          const reg = /-and-|-or-|\sand\s|\sor\s/g;
          const groupCount = query[key].split(reg).length;
          const Groups = new Array(groupCount).fill({});

          Groups[0] = {
            exec: 'where',
            part: query[key],
            params: createParameters({ part: query[key] }),
          };
          // whereNull can be used because null values can't be compared by the operators like `=`
          if (Groups[0].params[2] === null) {
            if (Groups[0].params[1] === '=') {
              Groups[0].exec = 'whereNull';
            } else if (Groups[0].params[1] === '<>') {
              Groups[0].exec = 'whereNotNull';
            }
          }

          if (groupCount > 1) {
            let i = 1;
            const matches = [...query[key].matchAll(reg)];
            for (const match of matches) {
              const conjuctive = match[0].replace(/-/g, '');
              const index = match.index + match[0].length;
              const nextIndex = matches[i] ? matches[i].index : undefined;

              Groups[i].exec = `${conjuctive}Where`;
              Groups[i].part = query[key].slice(index, nextIndex);
              Groups[i].params = createParameters(Groups[i]);

              // whereNull can be used because null values can't be compared by the operators like `=`
              if (Groups[i].params[2] === null) {
                if (Groups[i].params[1] === '=') {
                  Groups[i].exec =
                    conjuctive == 'or' ? `orWhereNull` : `whereNull`; // knex doesn't support andWhereNull
                } else if (Groups[i].params[1] === '<>') {
                  Groups[i].exec =
                    conjuctive == 'or' ? 'orWhereNotNull' : 'whereNotNull'; // knex doesn't support andWhereNotNull
                }
              }
              i++;
            }

            // update first part
            const firstIndex = matches[0].index;
            Groups[0].part = query[key].slice(0, firstIndex);
            Groups[0].params = createParameters(Groups[0]);
          }
          
          Groups.forEach((g, i) => {
            Groups[i].params = getSpecialParameters(Groups[i], { context, params, row });
          });

          query[key] = Groups;
        }
        break;
      case 'exclude':
        // Normally "exclude" option is defined inside of the "api.routes" config
        // This will overwrite the existing "exclude" properties

        // example query is: ?exclude=id:updated_at:created_at
        const excludeColumns = query.exclude.split(/[:,]/gi);
        columns.forEach((col, i) => {
          // exclude columns
          if (excludeColumns.find(C => col == C)) {
            columns.splice(i, 1);
          }
        });
        break;
    }
  }

  return query;
};

const createParameters = group => {
  if (!group || !group.part) return;

  let [column, condition, value] = group.part.split('-');
  let operator = '='; // default
  column = column || 'id';
  condition = condition || 'eq';

  // if condition is not specified, value would be false
  if (typeof value === 'undefined') {
    value = condition; // condition become actual value
    condition = 'eq'; // default condition is 'equal'
  }

  // condition and value is not specified
  if (condition == value) {
    value = null;
  }

  // value is null
  if (value === 'null') value = null;
  else if (value === 'undefined') value = null;

  // convert the condition into operator so that knex can understand it
  switch (condition) {
    case 'like':
      operator = 'like';
      break;
    case 'not':
    case 'neq':
      operator = '<>';
      break;
    case 'eq':
      operator = '=';
      break;
    case 'lg':
      operator = '>';
      break;
    case 'lge':
      operator = '>=';
      break;
    case 'sm':
      operator = '<';
      break;
    case 'sme':
      operator = '<=';
      break;
    default:
      operator = '=';
      break;
  }

  return [column, operator, value];
};
const getSpecialParameters = (group, { context, params, row }) => {
  // assign special variables to the query
  return group.params.map(p => {
    if(typeof p === 'string' && (p.includes('row.') || p === '#context')) {
      let key;

      if (p === '#context') {
        // replace `#context` with the current context
        // context is the parent model name
        group.params[2] = context;

        // in some cases the `context` can be defined as a special string
        // eg. parentPopulateObject: { from: row.key, populate: ['x'] }
        // x's `context` will be 'row.key'
        if (context.startsWith('row.')) {
          key = context.split('row.')[1];
        }
      } else if (p.startsWith('row.')) {
        // you can assign row values to the where parameters
        // e.g. query: { where: 'id-eq-row.id' } (inside of the populate object)
        key = p.split('row.')[1]; // get the key from the parameter
      } else if (p.startsWith('req.params.')) {
        // you can assign req.params values to the where parameters
        // if params are defined corresponding values will be used
        // get variable string
        key = p.split('req.params.')[1];
      }

      if (typeof key !== 'undefined') {
        if (row) {
          // throw error if row column is undefined
          if (!(key in row)) {
            throw Error(
              `sub-controller: row.${key} is not defined where: "${group.params}"`
            );
          }

          // assign the row value to the where parameter
          p = row[key];
        } else if (params) {
          // don't allow to use if key is not in the req.params
          if (!(key in params)) {
            throw new Error(
              `sub-controller: params.${key} is not defined where: "${group.params}"`
            );
          }

          // assign the req.params value to the where parameter
          p = params[key];
        }
      }
    }

    return p;
  });
};

module.exports = UrlQueryBuilder;
