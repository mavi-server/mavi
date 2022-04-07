/**
 * @type {import('../../types').UrlQueryBuilder}
 * @description $query should not mutated directly. Instead allocate a new array and return it.
 */
//  const UrlQueryBuilder = async (query, columns, { context, params, row })
const UrlQueryBuilder = (req, row) => {
  // overwrite the req.query with the api.config.query
  if (typeof req.config.query === 'object') {
    req.config.query = { ...req.query, ...req.config.query };
    // Check if there is a pre-configured query
    // Pre-configured queries can be defined inside of the "api.routes"
    // All pre-configured queries should be strings
  }

  const { config, params, query } = req;
  const defaultQuery = { where: [] };

  if (query && typeof query !== 'string' && !Array.isArray(query)) {
    // merge req.query and config.query
    for (const key in query) {
      if (typeof config.query === 'undefined') config.query = defaultQuery;

      // if req.query predefined in config.query
      if (key in config.query) {
        // check predefined query with its state
        // example: { query: { limit: [5, 'on'] } }
        // limit is 5 but can be overwritten by the incomming query
        // /posts?limit=10 will change the limit to 10
        // off = internal query
        if (Array.isArray(config.query[key])) {
          const [q, state] = config.query[key];

          // let incomming query
          if (state !== 'off') {
            config.query[key] = query[key];
          }

          // use predefined query
          else if (state === 'off') {
            config.query[key] = q.replace(/\$/g, ''); // remove $ if user forget to remove it. because its already internal where query.
          }
        }

        // let incomming query
        else if (config.query[key] !== 'off') {
          // concatinate unique where queries and detect off columns
          if (key === 'where') {
            // split the query into groups
            const reg = /-and-|-or-|\sand\s|\sor\s/g;
            const c_where = config.query[key].split(reg);
            const q_where = query[key].split(reg);
            const affected_cols = [];

            /** TODO:
             * check conjuctives. right now only 'and' works
             */
            c_where.forEach(cw_str => {
              const [$cw_col] = cw_str.split('-'); // might be off column
              const isOff = $cw_col.slice(0, 1) === '$'; // dolar sign means off column
              const cw_col = isOff ? $cw_col.slice(1) : $cw_col; // real colum name

              // if internal where query is off, that means req.query.where cannot overwrite to that column
              // config column is not off:
              if (!isOff) {
                // find the same column in incomming where query
                let qw_str = q_where.find(qw_str => {
                  const [qw_col] = qw_str.split('-');
                  return qw_col === cw_col;
                });

                // req.query.where column is defined in config.query.where
                if (qw_str) {
                  // update query:
                  config.query[key] = config.query[key].replace(cw_str, qw_str); // replace cw_str with the qw_str
                  affected_cols.push(qw_str.split('-')[0]); // keep the incomming where query
                }
              } else {
                affected_cols.push(cw_col);
              }
            });

            q_where
              .filter(qw_str => !affected_cols.includes(qw_str.split('-')[0]))
              .forEach(qw_str => {
                // concatinate queries
                config.query[key] = config.query[key] + `-and-${qw_str}`;
              });
          }

          // other queries
          else {
            config.query[key] = query[key];
          }
        }

        // remove query type
        else if (config.query[key] === 'off') {
          if (key === 'where')
            config.query[key] = []; // where should be an array
          else delete config.query[key];
        }
      }
      // config.query not defined, let incomming query
      else {
        config.query[key] = query[key];
      }
    }
  } else if (!config || !config.query || config.query === 'off') {
    return (config.query = defaultQuery);
  }

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

    // have to parse these values:
    if (value === 'null') value = null;
    else if (value === 'true') value = true;
    else if (value === 'false') value = false;
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
          if (config.context.startsWith('row.')) {
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

  // Build url queries
  return config.query
    ? Object.keys(config.query)
      .filter(key => {
        // where query should be an array even if its off
        if (key === 'where' && config.query[key] === 'off') {
          config.query[key] = [];
        }

        return config.query[key] !== 'off';
      })
      .reduce((Q, key) => {
        switch (key) {
          case 'limit': // (number)
          case 'start': // (number)
            Q[key] = Number(config.query[key]);
            break;
          case 'sort': // (column|columns, direction, nulls)
            // https://knexjs.org/#Builder-orderBy

            // examples:
            // simple sort: "name-asc"
            // multiple sort: "name-desc:created_at-asc-first:id-desc-last"

            if (typeof config.query[key] === 'string') {
              const Groups = config.query[key].split(':');
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
            if (typeof config.query[key] === 'string') {
              // clear $ signs
              config.query[key] = config.query[key].replace(/\$/g, '');

              // split the query into groups
              const reg = /-and-|-or-|\sand\s|\sor\s/g;
              const groupCount = config.query[key].split(reg).length;
              const Groups = new Array(groupCount).fill({});

              Groups[0] = {
                exec: 'where',
                part: config.query[key],
                params: createParameters({ part: config.query[key] }),
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
                const matches = [...config.query[key].matchAll(reg)];

                for (const match of matches) {
                  const conjuctive = match[0].replace(/-|\s/g, '');
                  const index = match.index + match[0].length;
                  const nextIndex = matches[i] ? matches[i].index : undefined;

                  const exec = `${conjuctive}Where`;
                  const part = config.query[key].slice(index, nextIndex);
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
                Groups[0].part = config.query[key].slice(0, firstIndex);
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
            const excludeColumns = config.query.exclude.split(/[:,]/gi);
            config.columns.forEach((col, i) => {
              // exclude columns
              if (excludeColumns.find(C => col == C)) {
                config.columns.splice(i, 1);
              }
            });
            break;
        }

        return Q;
      }, defaultQuery)
    : defaultQuery;
};

module.exports = UrlQueryBuilder;
