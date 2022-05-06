/**
 * @type {import('../../types').UrlQueryBuilder}
 * @description $query should not mutated directly. Instead allocate a new array and return it.
 */
//  const UrlQueryBuilder = async (query, columns, { context, params, row })
const UrlQueryBuilder = (req, row) => {
  const { config, params, query } = req;
  const defaultQuery = { where: [] };
  const lockReg = /lock|\$/g;
  const isQueryLocked = str =>
    Boolean(
      ['$', 'lock', 'locked', '$lock', '$locked'].find(
        locked => str === locked
      )
    );
  const isColumnLocked = str =>
    typeof str === 'string' && (str.startsWith('$') || str.match(lockReg));
  let Q = {}; // main query

  const mergeAndSecureQueries = () => {
    // internal query = config.query
    // incoming query = req.query
    
    if (query && typeof query !== 'string' && !Array.isArray(query)) {
      // If config query is locked
      if(isColumnLocked(config.query)) {
        return (Q = defaultQuery);
      }

      // If internal query is not defined, use incoming query
      if (typeof config.query === 'undefined') {
        Q = { ...query };
      }

      // There is no incoming query
      // Use internal queries
      else if (Object.keys(query).length === 0) {      
        for (const key in config.query) {
          // if array syntax
          if (Array.isArray(config.query[key])) {
            const [q] = config.query[key];

            // use pre-configured query
            if (key === 'where') {
              Q[key] = q.replace(/\$/g, ''); // clear uneccessary $ signs because query is completely locked
            } else Q[key] = q;
          }

          // query is completely locked
          else if (isQueryLocked(config.query[key])) {
            if (key === 'where') {
              // default where should be an empty array
              Q[key] = [];
            }
          }

          // not locked
          else {
            // some where columns can be locked
            if (key === 'where') {
              // remove lock signs
              Q[key] = config.query[key].replace(/\$/g, '');
            }
          }
        }        
      }
      // Merge incoming query and internal query
      else {
        // pass incoming queries if they're not locked
        for (const key in config.query) {
          // the incoming query has pre-configured
          if (key in query) {
            // If array syntax, means locked
            // example: { query: { limit: [5] } }
            // limit is 5 but cannot be overwritten by the incoming query
            // /posts?limit=10 will not change the limit
            if (Array.isArray(config.query[key])) {
              const [q] = config.query[key];

              // use pre-configured query
              if (key === 'where') {
                Q[key] = q.replace(/\$/g, ''); // clear uneccessary $ signs because query is completely locked
              } else {
                Q[key] = q;
              }
            }

            // query is locked
            else if (isQueryLocked(config.query[key])) {
              // where should be an empty array
              if (key === 'where') {
                Q[key] = [];
              }
            }

            // not locked
            // pass incoming query (other then 'where')
            // will check locked columns for 'where'
            else {
              // concatinate unique where queries and detect locked columns
              if (key === 'where') {
                const reg = /-and-|-or-|\sand\s|\sor\s/g; // where syntax splitter
                const c_where = config.query[key].split(reg); // internal|req.config where
                const q_where = query[key].split(reg); // incoming|req.query where

                // assign default where string
                Q[key] = config.query[key];

                /** TODO:
                 * check conjuctives too. right now only 'and' works, 'or' not.
                 */
                for (const qw_str of q_where) {
                  const [qw_col] = qw_str.split('-');

                  // config column is not locked:
                  // pass incoming where queries that are not locked
                  for (const cw_str of c_where) {
                    const [$cw_col] = cw_str.split('-'); // might be locked column
                    const cw_col = $cw_col.replace(/\$/g, ''); // real colum name

                    // update 'where' if it is pre-defined:
                    if (cw_col === qw_col) {
                      // if internal where query is locked, that means req.query.where cannot overwrite to that column
                      if (isColumnLocked($cw_col)) {
                        // skip
                        continue;
                      }

                      // update
                      Q[key] = Q[key].replace(cw_str, qw_str); // replace cw_str with the qw_str
                    }

                    // concatinate new where query
                    else {
                      // add
                      Q[key] = Q[key].concat(`-and-${qw_str}`);
                    }
                  }
                }

                // clear $ signs
                Q[key] = Q[key].replace(/\$/g, '');
              }

              // pass query
              else {
                Q[key] = query[key];
              }
            }
          }

          // set internal queries
          else {
            // if array syntax
            if (Array.isArray(config.query[key])) {
              const [q] = config.query[key];

              // use pre-configured query
              if (key === 'where') {
                Q[key] = q.replace(/\$/g, ''); // clear uneccessary $ signs because query is completely locked
              } else Q[key] = q;
            }

            // query is locked
            else if (isQueryLocked(config.query[key])) {
              // where should be an empty array
              if (key === 'where') {
                Q[key] = [];
              }
            }
            // set unlocked queries
            else {
              if (key === 'where') {
                Q[key] = config.query[key].replace(/\$/g, '');
              } else {
                Q[key] = config.query[key];
              }
            }
          }
        }

        // pass remained incoming queries
        for (const key in query) {
          if (!(key in config.query)) {
            if (key === 'where') {
              Q[key] = query[key].replace(/\$/g, '');
            } else {
              Q[key] = query[key];
            }
          }
        }
      }
    } else if (!config || !config.query || isColumnLocked(config.query)) {
      return (Q = defaultQuery);
    }

    // Default where is always an empty array
    if (!Q.where) {
      Q.where = [];
    }
  };
  const createParameters = group => {
    if (!group || !group.part) return;

    let [column, condition, value] = group.part.split('-');
    let operator = '='; // default
    column = column || 'id';

    // if condition is not specified, value would be false
    if (typeof value === 'undefined') {
      value = condition; // condition become actual value
    }

    // have to parse these values:
    if (value === 'null') value = null;
    else if (value === 'true') value = true;
    else if (value === 'false') value = false;
    else if (value === 'undefined') value = null;

    // convert the condition into operator so that knex can understand it
    switch (condition) {
      case 'in': // includes (case insensitive)
        operator = 'ilike';
        break;
      case 'ins': // includes (case sensitive)
        operator = 'like';
        break;
      case 'nin': // not includes (case insensitive)
        operator = 'not ilike';
        break;
      case 'nins': // not includes (case sensitive)
        operator = 'not like';
        break;
      case 'eq':
        operator = '=';
        break;
      // case 'not': // not should be moved to exec part
      case 'neq':
        operator = '<>';
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
      default: // default is equal
        // Is string?
        if (isNaN(Number(value)))
          operator = 'ilike'; // default is insensitive like
        // Is number?
        else operator = '=';
        break;
    }

    // Default like wildcards
    if (operator.includes('like')) {
      if (!value.includes('%')) value = `%${value}%`;
    }

    return [column, operator, value];
  };
  const getSpecialParameters = group => {
    if (!Array.isArray(group.params)) return [];

    // assign special variables to the query
    return group.params.map(p => {
      let key;
      if (typeof p === 'string') {
        if (p === '#context') {
          // replace `#context` with the current context
          // context is the parent model name
          p = config.context;

          // in some cases the `context` can be defined as a special string
          // eg. parentPopulateObject: { from: row.key, populate: ['x'] }
          // x's `context` will be 'row.key'
          if (config.context && config.context.startsWith('row.')) {
            key = config.context.split('row.')[1];
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
            p = row[key] || null;
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

  // Merge and secure queries
  mergeAndSecureQueries();  

  // Build url queries
  for (const key in Q) {
    switch (key) {
      case 'limit': // (number)
      case 'start': // (number)
        Q[key] = Number(Q[key]);
        break;
      case 'sort': // (column|columns, direction, nulls)
        // https://knexjs.org/#Builder-orderBy

        // examples:
        // simple sort: "name-asc"
        // multiple sort: "name-desc:created_at-asc-first:id-desc-last"

        if (typeof Q[key] === 'string') {
          const Groups = Q[key].split(/[:,]/gi);
          Q[key] = [];

          for (const group of Groups) {
            let [column, order] = group.split('-');
            column = column || 'id';
            order = order || 'asc';
            // nulls = nulls || 'last' // not works idk why

            Q[key].push({ column, order });
          }
        }
        break;
      case 'where': // (column, operator, value|values)
        // examples:
        // simple where: where=id-1-and-community-eq-1-or-name-like-%test%
        if (typeof Q[key] === 'string') {
          // split the query into groups
          const reg = /-and-|-or-|\sand\s|\sor\s/g;
          const groupCount = Q[key].split(reg).length;
          const Groups = new Array(groupCount).fill({});

          Groups[0] = {
            exec: 'where',
            part: Q[key],
            params: createParameters({ part: Q[key] }),
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
            const matches = [...Q[key].matchAll(reg)];

            for (const match of matches) {
              const conjuctive = match[0].replace(/-|\s/g, '');
              const index = match.index + match[0].length;
              const nextIndex = matches[i] ? matches[i].index : undefined;

              const exec = `${conjuctive}Where`;
              const part = Q[key].slice(index, nextIndex);
              const params = createParameters({ part });
              Groups[i] = { exec, part, params };

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
            Groups[0].part = Q[key].slice(0, firstIndex);
            Groups[0].params = createParameters(Groups[0]);
          }

          for (let i = 0; i <= Groups.length - 1; i++) {
            Groups[i].params = getSpecialParameters(Groups[i]);
          }

          Q[key] = Groups;
        }
        break;
      case 'exclude':
        // Normally "exclude" option is defined inside of the "api.routes" config
        // This will overwrite the existing "exclude" properties

        // example query is: ?exclude=id:updated_at:created_at
        const excludeColumns = Q[key].split(/[:,]/gi);
        config.columns.forEach((col, i) => {
          // exclude columns
          if (excludeColumns.find(C => col == C)) {
            config.columns.splice(i, 1);
          }
        });
        break;
    }
  }

  return Q;
};
module.exports = UrlQueryBuilder;
