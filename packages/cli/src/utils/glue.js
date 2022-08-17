const { readdirSync } = require('fs');
/**
 * @description Glue(combine) the projected mavi configurations into one object tree.
 */
module.exports = ({ cwd }) => {
  /**
   * @type {import('../../../../types').Mavi.config}
   */
  let config = {};

  // get files in root directory
  const files = readdirSync(cwd);

  // config name can be mavi.config or index
  const configName = files.find(file =>
    ['mavi.config.ts', 'mavi.config.js', 'mavi.config.json', 'index.js', 'index.json'].find(
      f => f == file
    )
  );

  // find mavi.config
  // Todo: Simplify them in a single for loop later.
  if (files.find(file => file === configName)) {
    config = require(`${cwd}/${configName}`);
    config.api = config.api || {};
    config.api.define = config.api.define || {};

    // get database environments
    if (!config.database && files.find(file => file === 'database')) {
      config.database = {};
      const environments = readdirSync(`${cwd}/database`);
      environments.forEach(database_config => {
        const [environment, ext] = database_config.split('.');

        if (!ext.match(/js|json/)) return;

        config.database[
          environment
        ] = require(`${cwd}/database/${database_config}`);
      });
    }

    // get defined routes
    if (!config.api.routes && files.find(file => file === 'routes')) {
      config.api.routes = {};
      const routes = readdirSync(`${cwd}/routes`);
      routes.forEach(route => {
        const [name, ext] = route.split('.');
        const path = name === 'base' ? '/' : `/${name}`;
        const file = require(`${cwd}/routes/${route}`);

        if (!ext.match(/js|json/)) return;

        config.api.routes[path] = file;
      });
    }

    // get defined models
    if (!config.api.define.models && files.find(file => file === 'models')) {
      config.api.define.models = {};
      const models = readdirSync(`${cwd}/models`);
      models
        .filter(model => !model.includes('.seed'))
        .forEach(model => {
          const [name, ext] = model.split('.');
          const file = require(`${cwd}/models/${model}`);

          if (!ext.match(/js|json/)) return;

          config.api.define.models[name] = file;
        });
    }

    // get defined controllers
    if (
      !config.api.define.controllers &&
      files.find(file => file === 'controllers')
    ) {
      config.api.define.controllers = {};
      const controllers = readdirSync(`${cwd}/controllers`);
      controllers.forEach(controller => {
        const [name, ext] = controller.split('.');
        const file = require(`${cwd}/controllers/${controller}`);

        if (!ext.match(/js|json/)) return;

        config.api.define.controllers[name] = file;
      });
    }

    // get defined middlewares
    if (
      !config.api.define.middlewares &&
      files.find(file => file === 'middlewares')
    ) {
      config.api.define.middlewares = {};

      const middlewares = readdirSync(`${cwd}/middlewares`);
      middlewares.forEach(middleware => {
        const [name, ext] = middleware.split('.');
        const file = require(`${cwd}/middlewares/${middleware}`);

        if (!ext.match(/js|json/)) return;

        config.api.define.middlewares[name] = file;
      });
    }

    // get defined populate
    if (
      !config.api.define.populate &&
      files.find(file => file === 'populate')
    ) {
      config.api.define.populate = {};

      const populate = readdirSync(`${cwd}/populate`);
      populate.forEach(populate => {
        const [name, ext] = populate.split('.');
        const file = require(`${cwd}/populate/${populate}`);

        if (!ext.match(/js|json/)) return;

        config.api.define.populate[name] = file;
      });
    }

    // get defined utils
    if (!config.api.define.utils && files.find(file => file === 'utils')) {
      config.api.define.utils = {};

      const utils = readdirSync(`${cwd}/utils`);
      utils.forEach(utils => {
        const [name, ext] = utils.split('.');
        const file = require(`${cwd}/utils/${utils}`);

        if (!ext.match(/js|json/)) return;

        config.api.define.utils[name] = file;
      });
    }

    return config;
  }

  // mavi config is not found
  console.log(
    'Mavi config is not found. Please create at the <root>/mavi.config.js'
  );
  process.exit(1);
};
