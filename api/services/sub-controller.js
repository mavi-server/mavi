// Sub Controller for populating relations
// Also can be referred as 'population controller'

const UrlQueryBuilder = require('./url-query-builder');
const SubController = async function (req, { populate, data, context }) {
  const knex = req.app.db;

  if (Array.isArray(data) == false) {
    data = [data || {}];
  }

  return await Promise.all(
    data.map(async row => {
      await Promise.all(
        populate.map(async config => {
          // must
          if (!config.query) config.query = {};

          // optional from: get 'from' value from request's param slug
          if (config.from.includes('req.params.')) {
            const [, key] = config.from.split('req.params.');
            if (req.params[key]) {
              config.from = req.params[key];

              // ** temporary security fix:
              // ** hide hash and private fields when 'req.params' used as `from` value
              // *** normally these process should be done in `hydrate-routes` before the router initialization
              const table = req.app.$config.api.define.models[config.from];
              if (table) {
                const columns = Object.keys(table).filter(
                  c => !(c === 'hash' || table[c].private)
                );
                config.columns = columns;
              }
            } else
              throw Error(`sub-controller: req.params.${key} is not defined`);
          }

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
          } = config;

          if (controller || type) {
            // convert user's url queries to objects
            // the objects will be used to build sub sql query
            UrlQueryBuilder(query, columns);

            // assign special variables to the query
            if (query.where) {
              query.where.find(w => {
                if (w.params.includes('#context')) {
                  return (w.params[2] = context);
                }
              });
            }

            switch (controller || type) {
            case 'count': {
              const queryBuilder = knex(from);

              if (select && on) {
                if (!query.where) query.where = [];

                // on:
                query.where.push({ exec: 'where', params: [on, '=', row.id] });

                // is-owner
                if (req.owner) {
                  if (req.config.model === 'users')
                    query.where.push({
                      exec: 'where',
                      params: ['id', '=', req.owner.id],
                    });
                  else
                    query.where.push({
                      exec: 'where',
                      params: ['user', '=', req.owner.id],
                    });
                }

                // apply where queries
                if (query.where) {
                  for (const group of query.where) {
                    queryBuilder[group.exec](...group.params);
                  }
                }

                // populate:
                const data = await queryBuilder
                  .count('*')
                  .then(res => ({ [select]: Number(res[0].count) }));
                Object.assign(row, data);
              } else {
                const message =
                    'sub-controller: `on` & `select` option should be defined';
                console.error(message);
                throw Error({ message });
              }
              break;
            }
            case 'token-reference': {
              const queryBuilder = knex(from);

              if (select) {
                // only users with identity can use this sub controller
                if (req.user && req.user.id) {
                  const where = {
                    user: req.user.id, // reference token
                    [on || select]: row.id, // referencing column
                  };

                  const reference = await queryBuilder
                    .first(columns)
                    .where(where);
                  if (reference) {
                    if (returning) {
                      if (returning === '*') row[select] = reference;
                      else if (columns.includes(returning))
                        row[select] = reference[returning];
                      else {
                        const message = `sub-controller: returning column ${returning} is not defined`;
                        console.error(message);
                        throw Error({ message });
                      }
                    } else row[select] = reference.id || null;
                  } else row[select] = null;
                }
              } else {
                const message =
                    'sub-controller: `select` option should be defined';
                console.error(message);
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
              const queryBuilder = knex(from);

              // if row have an id
              if (select && row[select]) {
                row[select] = await queryBuilder
                  .first(columns)
                  .where({ id: row[select] });

                if (populate) {
                  // deep populate
                  try {
                    row[select] = await SubController(req, {
                      populate,
                      data: row[select],
                      context: config.from,
                    });
                    if (Array.isArray(row[select]))
                      row[select] = row[select][0];
                  } catch (err) {
                    throw err;
                  }
                }
              }
              break;
            }
            case 'array': {
              const queryBuilder = knex(from);

              // if row have an id
              if (select && row[select]) {
                if (query.sort) {
                  queryBuilder.orderBy(query.sort);
                }
                if (query.start) {
                  queryBuilder.offset(query.start);
                }
                if (query.limit || !query.limit) {
                  queryBuilder.limit(query.limit || 10);
                }

                // Handle where queries:
                if (!query.where) query.where = [];

                // on:
                query.where.push({
                  exec: 'where',
                  params: ['id', '=', row[select]],
                });

                // is-owner
                if (req.owner) {
                  if (req.config.model === 'users')
                    query.where.push({
                      exec: 'where',
                      params: ['id', '=', req.owner.id],
                    });
                  else
                    query.where.push({
                      exec: 'where',
                      params: ['user', '=', req.owner.id],
                    });
                }

                // apply where queries
                if (query.where) {
                  for (const group of query.where) {
                    queryBuilder[group.exec](...group.params);
                  }
                }

                // populate selected row:
                row[select] = await queryBuilder.first(columns);
              }

              if (populate) {
                // deep populate
                try {
                  row[select] = await SubController(req, {
                    populate,
                    data: row[select],
                    context: config.from,
                  });
                } catch (err) {
                  throw err;
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
        })
      );

      return row;
    })
  );
};

module.exports = SubController;
