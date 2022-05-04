// Only works if the table schemas are defined inside of the `models` folder

/**
 * @description Hash model files and model columns to detect changes
 * @type {({
 *  model: import('../../../../../types').Model.Properties,
 *  key: string,
 *  dir: string
 * }) => void}
 */
module.exports = async ({ model, key, dir }) => {
  let newHashAssigned = false;

  if (!model.hash) {
    // assign new model hash
    model.hash = Buffer.from(`[${Date.now()}]${key}`).toString('base64url');
    newHashAssigned = true;

    console.log(`\x1b[35m[Assigned new hash: ${key}]\x1b[0m`);
  }

  for (const column in model) {
    if (column === 'hash') continue;
    if (!model[column].hash) {
      // assign new column hash
      const buffer = Buffer.from(`[${Date.now()}]${key}.${column}`);
      model[column].hash = buffer.toString('base64url');
      newHashAssigned = true;

      console.log(`\x1b[35m[Assigned new hash: ${key}.${column}]\x1b[0m`);
    }
  }

  if (newHashAssigned) {
    const { writeFile } = require('fs');
    const util = require('util');
  
    // overwrite assigned hashed to the model file
    if (dir) {
      const filename = `${dir}/${key}.js`;
      const content = `module.exports = ${util.inspect(model, false, 2)}`;
      const cb = err => {
        if (err) throw err;
        console.log(`\x1b[32m[${key}.js updated]\x1b[0m`);
      };

      writeFile(filename, content, cb);
    }
    // else { // to index.js (not working yet)
    //   config.api.define.model = model
    //   let configFile = readFileSync(configPath, 'utf-8')
    //   const searchRegexp = RegExp(`${key}[ :](\{.*\:.*\})`, 'gm')
    //   const modelJSON = util.inspect(model, false, 2)
    //   configFile = configFile.replace(searchRegexp, `${key} : ${modelJSON}`)

    //   // // to config file
    //   writeFile(`${configPath}`, util.inspect(configFile, false, 1), (err) => {
    //     if (err) throw err
    //     console.log(`\x1b[32m[config.api.define.models.${key} updated]\x1b[0m`)
    //   })
    // }
  }
};
