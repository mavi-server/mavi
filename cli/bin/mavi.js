#!/usr/bin/env node

const command = process.argv[2];
const mode = process.env.NODE_ENV || 'development';
const readline = require('readline');
const { join } = require('path');

// Default config
const $config = require('../../config');

// User config
const config = require(join(process.cwd(), './index'));

// Default options
const options = {
  modelsDir: join(process.cwd(), './models/'),
};

// Package version
const { version } = require(join(__dirname, '../../package.json'));

// Assign default DB_STATE table name
if (!process.env.DB_STATE) {
  process.env.DB_STATE = 'mavi_db_state';
}

if (!config) {
  console.log('No config file found. Please create a config file at ./index.js');
  process.exit(1);
}

// neccessary for finding some relative paths in the config file
config.__dirname = join(__dirname, '../../config');

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
      const mavi = require(`../../index.js`);
      mavi.createServer(config);
    } else {
      const mavi = require(`../../dist/index.js`);
      mavi.createServer(config);
    }

    // log:
    console.log(`\x1b[36mStarting Mavi ${version} ${mode}...\x1b[0m`);

    // if not includes parameters, switch to the next command:
    const applycommands = ['-apply', '--apply', '-a', '--a'];
    if (!process.argv.find(arg => applycommands.find(c => c === arg))) {
      break;
    }
  case 'apply': {
    const applyModels = require(`../src/commands/apply`);
    const seedModels = require('../src/commands/seed');

    // log:
    console.log(`\x1b[36mLooking for changes...\x1b[0m`);

    // check if 'no seed' argument provided
    const noSeed = Boolean(
      process.argv.find(arg =>
        [
          '-no-seed',
          '-no-seeds',
          '--no-seed',
          '--no-seeds',
          '-ns',
          '--ns',
        ].find(c => c === arg)
      )
    );

    // run:
    applyModels(config, options)
      .then(() => {
        console.log(`\x1b[36mApply completed!\x1b[0m`);
      })
      .then(async () => {
        // Break the case if --no-seed indicated:
        if (!noSeed) {
          // run:
          await seedModels(config, options).then(() => {
            console.log(`\x1b[36mSeed completed!\x1b[0m`);
            process.exit(0);
          });
        }
      })
      .then(() => {
        // Apply
        if (command === 'apply') {
          process.exit(0);
        }

        // else, start the server
      });

    break;
  }
  case 'seed': {
    const seedModels = require('../src/commands/seed');

    // run:
    seedModels(config, options).then(() => {
      console.log(`\x1b[36mSeed completed!\x1b[0m`);
      process.exit(0);
    });
    break;
  }
  case 'clear': {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      `\x1b[31mClear all \x1b[36m${mode}\x1b[0m \x1b[31mdatabase?\x1b[0m (yes/no): `,
      answer => {
        if (answer.toLocaleLowerCase() === 'yes') {
          const clearTables = require(`../src/commands/clear`);

          // log:
          console.log(`\x1b[31mClearing Tables...\x1b[0m`);

          // run:
          clearTables(config).then(() => {
            console.log(`\x1b[36mCleaning completed!\x1b[0m`);
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
  case 'drop': {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      `\x1b[31mDrop all \x1b[36m${mode}\x1b[0m \x1b[31mdatabase?\x1b[0m (yes/no): `,
      answer => {
        if (answer.toLocaleLowerCase() === 'yes') {
          const dropModels = require(`../src/commands/drop`);

          // log:
          console.log(`\x1b[31mDropping Models...\x1b[0m`);

          // run:
          dropModels(config).then(() => {
            console.log(`\x1b[36mDropping completed!\x1b[0m`);
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
}
