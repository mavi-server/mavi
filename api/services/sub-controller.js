// Sub Controller for populating relations
// Also can be referred as 'population controller'

const UrlQueryBuilder = require('./url-query-builder');
const SubController = function (req, { populate, data, parent }) {
  const knex = req.app.db;

  if (Array.isArray(data) == false) {
    data = [data || {}];
  }

  data = data.map(async row => {
    /**
     * @param {import('../../types').Populate.Properties} config
     * @description Populate rows with the given populate configurations
     */
    const populateRow = async function ({
      select, // column
      from, // table
      columns, // select populated data columns
      on, // referencing to the row[id] value. used in where statements
      on2, // will be removed later
      type /* type will be removed later, controller will be used instead */,
      controller,
      query,
      populate, // recursively populate - deep populate
      returning, // "token-reference" option
      exclude,
      context, // context is the parent row's model name
    }) {
      /** @type {import('../../types').Populate.Properties} */
      const config = arguments[0];

      // you can assign row value to the from value
      // e.g. { from: row.type } will assign row.type to from value
      if (from.startsWith('row.')) {
        // parent row column key
        const key = from.split('row.')[1];
        if (parent && key in parent)
          from = parent[key]; // check parent for >1 level deep populate
        else if (row && key in row)
          from = row[key]; // check row for just 1 level deep populate
        else {
          throw Error(`row.${key} is not defined`);
        }
        // ** temporary security fix:
        // ** hide hash and private fields when 'row.value' used as a dynamic `from` value
        // *** normally static `from` value processes should be done in `hydrate-routes` before the router initialization
        if (from in req.app.$config.api.define.models) {
          const table = req.app.$config.api.define.models[from];
          const excludeColumns = c =>
            !(c === 'hash' || table[c].private || exclude.includes(c));
          const cols = Object.keys(table).filter(excludeColumns);
          columns = cols;
        } else {
          throw Error(`${from} is not defined`);
        }
      }
      if (context.startsWith('row.')) {
        // parent row column key
        const key = context.split('row.')[1];
        if (parent && key in parent)
          context = parent[key]; // check parent for >1 level deep populate
        else if (row && key in row)
          context = row[key]; // check row for just 1 level deep populate
        else {
          throw Error(`row.${key} is not defined`);
        }
      }

      if (controller || type) {
        // build pre-defined clauses into the queries
        // queries will be used to build sub sql query
        // Url Query Builder:
        query = await UrlQueryBuilder({ config }, parent);

        // handle where clause | open `where` for inner queries
        if (!query.where || query.where === 'off') query.where = [];
        let $where = [...query.where]; // clone query.where

        // query.where.length && console.log('sub-controller.query:', JSON.stringify(query, null, 2));
        // populate && console.log("populate:", JSON.stringify(populate, null, 2));

        switch (controller || type) {
          case 'count': {
            if (select && on) {
              const queryBuilder = knex(from);

              // on:
              $where.push({
                exec: 'where',
                params: [on || select, '=', row.id],
              });

              // apply where queries
              for (const group of $where) {
                queryBuilder[group.exec](...group.params);
              }

              // populate:
              const data = await queryBuilder
                .count('*')
                .then(res => ({ [select]: Number(res[0].count) }));
              Object.assign(row, data);
            } else {
              throw Error('`on` & `select` option should be defined');
            }
            break;
          }
          case 'token-reference': {
            /**
             * Token reference needs a `user` column and
             * requests should be made with x-access-token header
             * then this sub-controller will be active
             */
            if (select) {
              // only users with identity can use this sub controller
              if (req.user && req.user.id) {
                const queryBuilder = knex(from);

                // on:
                $where.push(
                  {
                    exec: 'where',
                    params: ['user', '=', req.user.id], // reference token
                  },
                  {
                    exec: 'where',
                    params: [on || select, '=', row.id], // referencing column
                  }
                );
                if(on2 && row[on2]) {
                  $where.push(
                    {
                      exec: 'where',
                      params: [on2, '=', row[on2]], // referencing column
                    }
                  );
                }

                // apply where queries
                for (const group of $where) {
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
                      throw Error(
                        `returning column ${returning} is not defined`
                      );
                    }
                  } else row[select] = reference.id || null;
                } else row[select] = null;
              }
            } else {
              throw Error('`select` option should be defined');
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

              // will find ids in an array
              const findOne = id =>
                req.app
                  .db(from)
                  .first(columns)
                  .where({ id: Number(id) });

              if (Array.isArray(row[select])) {
                try {
                  row[select] = await Promise.all(row[select].map(findOne));
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

              // on:
              $where.push({
                exec: 'where',
                params: ['id', '=', row[select]],
              });

              // apply where queries
              for (const group of $where) {
                queryBuilder[group.exec](...group.params);
              }

              // fetch:
              row[select] = await queryBuilder.first(columns);

              // deep populate selected row:
              if (populate) {
                try {
                  row[select] = await SubController(req, {
                    populate,
                    data: row[select], // give selected row to the sub-controller
                    parent: row,
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

              // on:
              $where.push({
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
              for (const group of $where) {
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
                    parent: row,
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
        throw Error('`controller`or `type` option should be defined');
      }

      return row;
    };

    await Promise.all(populate.map(populateRow));

    // return populated row
    return row;
  });

  return Promise.all(data);
};

module.exports = SubController;
