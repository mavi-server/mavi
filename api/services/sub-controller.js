// Sub Controller for populating relations
// Also can be referred as 'population controller'

const UrlQueryBuilder = require('./url-query-builder');
const SubController = function (req, { populate, data, context }) {
  const knex = req.app.db;

  if (Array.isArray(data) == false) {
    data = [data || {}];
  }

  return Promise.all(
    data.map(async row => {
      await Promise.all(
        populate.map(
          /**
           * @param {import('../../types').Populate.Properties} config
           */
          async config => {
            // allocate new memory for each config
            // we do this because configs can be dynamic
            // eg. row and req.param values can be used during population
            // const config = { ...Config }; // clone config

            // you can assign row value to the config.from value
            // e.g. { config.from: row.type } will assign row.type to config.from value
            if (config.from.startsWith('row.')) {
              // row column key
              const key = config.from.split('row.')[1];

              if (row[key]) {
                config.from = row[key];
              } else {
                throw Error(`sub-controller: row.${key} is not defined`);
              }

              // ** temporary security fix:
              // ** hide hash and private fields when 'row.value' used as a dynamic `from` value
              // *** normally static `from` value processes should be done in `hydrate-routes` before the router initialization
              if (config.from in req.app.$config.api.define.models) {
                const table = req.app.$config.api.define.models[config.from];
                const columns = Object.keys(table).filter(
                  c => !(c === 'hash' || table[c].private || config.exclude.includes(c))
                );
                config.columns = columns;
              } else {
                throw Error(`sub-controller: ${config.from} is not defined`);
              }
            }


            // convert user's url queries to objects
            // the objects will be used to build sub sql query
            // Url Query Builder:
            config.query = UrlQueryBuilder(config.query, config.columns, {
              context,
              row,
            });

            const {
              select, // column
              from, // table
              columns, // select populated data columns
              on, // referencing to the row[id] value. used in where statements
              type /* type will be removed later, controller will be used instead */,
              controller,
              query,
              populate, // recursively populate - deep populate
              returning, // "token-reference" option
              // context, // parent model name - disabled because of a bug with the usage of row.value in `query.where` or `from`
            } = config;

            if (controller || type) {
              switch (controller || type) {
                case 'count': {
                  if (select && on) {
                    const queryBuilder = knex(from);

                    // handle where clause
                    if (!query.where) query.where = [];

                    // on:
                    query.where.push({
                      exec: 'where',
                      params: [on, '=', row.id],
                    });

                    // apply where queries
                    for (const group of query.where) {
                      queryBuilder[group.exec](...group.params);
                    }

                    // populate:
                    const data = await queryBuilder
                      .count('*')
                      .then(res => ({ [select]: Number(res[0].count) }));
                    Object.assign(row, data);
                  } else {
                    const message =
                      'sub-controller: `on` & `select` option should be defined';
                    throw Error({ message });
                  }
                  break;
                }
                case 'token-reference': {
                  if (select) {
                    // only users with identity can use this sub controller
                    if (req.user && req.user.id) {
                      const queryBuilder = knex(from);

                      // handle where clause
                      if (!query.where) query.where = [];

                      // on:
                      query.where.push(
                        {
                          exec: 'where',
                          params: ['user', '=', req.user.id], // reference token
                        },
                        {
                          exec: 'where',
                          params: [on || select, '=', row.id], // referencing column
                        }
                      );

                      // apply where queries
                      for (const group of query.where) {
                        queryBuilder[group.exec](...group.params);
                      }

                      // fetch the data
                      const reference = await queryBuilder.first(columns);

                      if (reference) {
                        if (returning) {
                          if (returning === '*') row[select] = reference;
                          else if (columns.includes(returning))
                            row[select] = reference[returning];
                          else {
                            const message = `sub-controller: returning column ${returning} is not defined`;
                            throw Error({ message });
                          }
                        } else row[select] = reference.id || null;
                      } else row[select] = null;
                    }
                  } else {
                    const message =
                      'sub-controller: `select` option should be defined';
                    throw Error({ message });
                  }
                  break;
                }
                case 'array-reference': {
                  if (select && row[select]) {
                    try {
                      row[select] = JSON.parse(row[select]);
                    } catch (err) {
                      console.error('sub-controller:', err.message);
                      row[select] = [];
                    }

                    if (Array.isArray(row[select])) {
                      try {
                        row[select] = await Promise.all(
                          row[select].map(
                            async id =>
                              await req.app
                                .db(from)
                                .first(columns)
                                .where({ id: Number(id) })
                          )
                        );
                      } catch (err) {
                        console.error('sub-controller:', err.message);
                      }
                    } else row[select] = null;
                  }
                  break;
                }
                case 'object': {
                  // if row have an id
                  if (select && row[select]) {
                    const queryBuilder = knex(from);

                    // handle where clause
                    if (!query.where) query.where = [];

                    // on:
                    query.where.push({
                      exec: 'where',
                      params: ['id', '=', row[select]],
                    });

                    // apply where queries
                    for (const group of query.where) {
                      queryBuilder[group.exec](...group.params);
                    }

                    // fetch:
                    row[select] = await queryBuilder.first(columns);

                    // deep populate selected row:
                    if (populate) {
                      try {
                        row[select] = await SubController(req, {
                          populate,
                          data: row[select],
                          context,
                        });

                        if (Array.isArray(row[select])) {
                          row[select] = row[select][0];
                        }
                      } catch (err) {
                        throw err;
                      }
                    }
                  }
                  break;
                }
                case 'array': {
                  // if row have an id
                  if (select && row[select]) {
                    const queryBuilder = knex(from);

                    // handle where clause
                    if (!query.where) query.where = [];

                    // on:
                    query.where.push({
                      exec: 'where',
                      params: ['id', '=', row[select]],
                    });

                    if (query.sort) {
                      queryBuilder.orderBy(query.sort);
                    }
                    if (query.start) {
                      queryBuilder.offset(query.start);
                    }
                    if (query.limit || !query.limit) {
                      queryBuilder.limit(query.limit || 10);
                    }

                    // apply where queries
                    for (const group of query.where) {
                      queryBuilder[group.exec](...group.params);
                    }

                    // fetch:
                    row[select] = await queryBuilder.first(columns);

                    // deep populate selected row:
                    if (populate) {
                      try {
                        row[select] = await SubController(req, {
                          populate,
                          data: row[select],
                          context,
                        });
                      } catch (err) {
                        throw err;
                      }
                    }
                  }
                  break;
                }
                default:
                  break;
              }
            } else {
              const message =
                'sub-controller: `controller`or `type` option should be defined';
              console.error(message);
              throw Error({ message });
            }

            return true;
          }
        )
      );

      return row;
    })
  );
};

module.exports = SubController;
