const { IncomingForm } = require('formidable');
const { existsSync, mkdirSync } = require('fs');
const { join } = require('path');
const { v4: uuidv4 } = require('uuid');
const handleControllerError = require('./utils/handle-controller-error');

module.exports = async function (childFolder, data) {
  const { model, columns } = this.req.config;

  if (childFolder) {
    const $options = this.req.config.options || {};

    // if controller has default options:
    // check childFolder has a permission to be used
    if ($options.folders) {
      if (!$options.folders.includes(childFolder)) {
        return {
          status: 400,
          data: "You don't have permission for this.req",
        };
      }
    }

    // default options:
    const options = {
      multiples: false,
      keepExtensions: true,
      uploadDir: join(process.cwd(), `/uploads/${childFolder}/`),
      maxFileSize: 5242880, // bytes = 5mb
      allowEmptyFiles: false,
      filter: function ({ name, originalFilename, mimetype }) {
        // keep only accepted mime types
        const accept = (options && options.accept) || 'image'; // default: image
        return mimetype && mimetype.includes(accept);
      },
      filename: function (name, ext, file) {
        // generate a unique filename
        return uuidv4() + ext;
      },
      ...$options, // overwrite default options
    };

    // create child directory if not exists
    if (!existsSync(options.uploadDir)) {
      mkdirSync(options.uploadDir);
    }

    // get incoming form data
    const form = new IncomingForm(options);

    // parse form data
    return new Promise((resolve, reject) => {
      form.parse(this.req);
      form.on('file', async (formname, file) => {
        if (!data) data = {};
        if (this.req.user) {
          data.user = this.req.user.id;
        }

        // data.id = Number((Math.random() * 10000).toFixed());
        data.url = `/uploads/${childFolder}/` + file.newFilename;
        data.alt =
          this.req.body.alt ||
          file.originalFilename.split('.').shift().replace(/-/g, ' ');

        // file uploaded
        if (file) {
          // send file informations
          if (!model || !columns) {
            return resolve({
              status: 201,
              data,
            });
          }

          // register file to database
          // and send file informations
          else {
            const [result] = await this.req.queryBuilder
              .insert(data)
              .returning(columns)
              .catch(handleControllerError);

            return resolve({
              status: 201,
              data: result,
            });
          }
        } else {
          return reject({
            status: 400,
            data: 'upload: `file` not defined',
          });
        }
      });
      form.on('error', async err => {
        return reject({
          status: 400,
          data: 'upload: ' + err,
        });
      });
    }); // end Promise
  } else {
    return {
      status: 400,
      data: 'upload: `childFolder` not defined',
    };
  }
};
