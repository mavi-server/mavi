#!/usr/bin/env node

const path = require('path');
const readline = require('readline');
// const $config = require('../../config');
const config = require(path.join(process.cwd(), './index'));
const command = process.argv[2];
const { version } = require(path.join(__dirname, '../../package.json'));
const mode = process.env.NODE_ENV || 'development';
let options;

if (!config) {
  console.log('No config file found. Please create a config file at ./index.js');
  process.exit(1);
}

// neccessary for finding some relative paths in the config file
config.__dirname = path.join(__dirname, '../../config');

switch (command) {
  case '-v':
  case '--v':
  case '-version':
  case '--version':
  case 'version':
    console.log(`\x1b[36mmavi v${version}\x1b[0m`);
    process.exit(0);
  case 'dev':
  case 'start':
  default:
    if (command === 'dev') {
      const mavi = require(path.join(__dirname, `../../index.js`));
      mavi.createServer(config);
    } else {
      const mavi = require(path.join(__dirname, `../../dist/index.js`));
      mavi.createServer(config);
    }

    // log:
    console.log(`\x1b[36mStarting Mavi ${version} ${mode}...\x1b[0m`);

    // if not includes parameters, switch to the next command:
    const applycommands = ['-apply', '--apply', '-a', '--a'];
    if (!process.argv.find(arg => applycommands.find(c => c === arg))) {
      break;
    }
  case 'apply':
    const db = require(path.join(__dirname, `../src/commands/apply-models.js`));

    // log:
    console.log(`\x1b[36mLooking for changes...\x1b[0m`);

    // options:
    options = {
      noSeed: Boolean(
        process.argv.find(
          arg =>
            arg == '-no-seed' ||
            arg == '--no-seed' ||
            arg == '-ns' ||
            arg == '--ns'
        )
      ),
    };

    // run:
    db.apply(options).then(() => {
      if (command === 'apply') process.exit(0);
      else {
        console.log(`\x1b[36mApply completed!\x1b[0m`);
        console.log(`\x1b[36mStarting Mavi ${version} ${mode}...\x1b[0m`);
      }
    });

    break;
  case 'remove':
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      `\x1b[31mAre you sure you want to remove your "${mode} database"?\x1b[0m (yes/no): `,
      answer => {
        if (answer.toLocaleLowerCase() === 'yes') {
          const removeModels = require(path.join(
            __dirname,
            `../src/commands/remove-models.js`
          ));

          // log:
          console.log(`\x1b[31mRemoving Models...\x1b[0m`);

          // run:
          removeModels().then(() => {
            console.log(`\x1b[36mRemove completed!\x1b[0m`);
            process.exit(0);
          });
        } else {
          console.log('\x1b[36mAborting...\x1b[0m');
          process.exit(0);
        }
      }
    );

    break;
}
