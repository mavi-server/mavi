/**
 * 
 * @param {object} models 
 * @param {object} options
 * @returns 
 */

const generateSchemaSQL = (models, options = {}) => {
  const SQL = {};
  for (const model in models) {
    const Table = models[model]; // alias
    let tableSchemaStringOne = [];
    let tableSchemaStringTwo = [];

    for (const column in Table) {
      if (column === 'hash') continue;

      const settings = Table[column];

      // type is required
      if (!settings.type) {
        throw Error('schema generator: type is required');
      }

      // create column string
      tableSchemaStringOne.push(generateColumnType(settings, column));

      // create column foreign
      const foreignKey = generateForeignKey(settings, column, model);
      if (foreignKey) tableSchemaStringTwo.push(foreignKey);
    }

    // set as function 
    // used as: knex.schema.createTable(tableName, (table) => {...tableSchemaString...})
    SQL[model] = [...tableSchemaStringOne, ...tableSchemaStringTwo].join(';');
  }


  if (options.debug) {
    console.log(SQL);
  }

  return SQL;
};

const generateColumnType = (settings, column) => {
  let columnSchemaString = `table.${settings.type}`;

  if (["integer", "tinyint", "string", "binary"].includes(settings.type)) {
    if ("maxlength" in settings) {
      columnSchemaString = columnSchemaString.concat(`('${column}', ${settings.maxlength})`);
    }
    else {
      columnSchemaString = columnSchemaString.concat(`('${column}')`);
    }
  }

  // set dataset if exists
  else if ("dataset" in settings) {
    // enum dataset
    columnSchemaString = columnSchemaString.concat(`('${column}', ${JSON.stringify(settings.dataset)})`);
  }

  // default value for timestamp and datetime is current time
  else if (settings.type.match(/datetime|timestamp/g)) {
    if (!("precision" in settings)) settings.precision = 6;
    if (!("useTz" in settings)) settings.useTz = true;

    columnSchemaString = columnSchemaString.concat(`('${column}', { useTz: ${settings.useTz}, precision: ${settings.precision} })`);

    // set default columns for special columns
    if (column.match(/[Cc]reate|[Uu]pdate/g)) {
      columnSchemaString = columnSchemaString.concat(`.defaultTo(knex.fn.now(${settings.precision}))`);
    }
  }
  else if (settings.type.match(/time/g)) {
    if ("precision" in settings) columnSchemaString = columnSchemaString.concat(`('${column}', { precision: ${settings.precision} })`);
  }
  else columnSchemaString = columnSchemaString.concat(`('${column}')`);

  if ("charset" in settings) columnSchemaString = columnSchemaString.concat(`.charset('${settings.charset}')`);
  if ("defaultTo" in settings) columnSchemaString = columnSchemaString.concat(`.defaultTo('${settings.defaultTo}')`);
  if ("comment" in settings) columnSchemaString = columnSchemaString.concat(`.comment('${settings.comment}')`);
  if ("unsigned" in settings) columnSchemaString = columnSchemaString.concat(`.unsigned()`);
  if ("constraints" in settings) {
    settings.constraints.forEach(constraint => {
      columnSchemaString = columnSchemaString.concat(`.${constraint}()`);
    });
  }

  return columnSchemaString;
};

const generateForeignKey = (settings, column, table) => {
  if ("references" in settings) {
    if (settings.references.split('.').length === 0) {
      throw Error('schema generator: `references` must be in format table.column');
    }

    let columnSchemaString = `table.foreign('${column}', '${table}_${column}__${settings.references.replace('.', '_')}_foreign')`;

    columnSchemaString = columnSchemaString.concat(`.references('${settings.references}')`);

    // set foreign key events
    const events = ['onDelete', 'onUpdate'];
    events.forEach(fn => {
      if (fn in settings) {
        settings[fn] = settings[fn].toUpperCase();
        columnSchemaString = columnSchemaString.concat(`.${fn}('${settings[fn]}')`);
      }
    });
    return columnSchemaString;
  }
};

module.exports = { generateSchemaSQL, generateColumnType, generateForeignKey };