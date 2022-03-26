#!/usr/bin/env node

const path = require("path");
const config = require(path.join(process.cwd(), './index'));
const command = process.argv[2];
const { version } = require(path.join(__dirname, '../../package.json'));
let script;

if (!config) {
  console.log('No config file found. Please create a config file at ./index.js');
  process.exit(1);
}

const mode = process.env.NODE_ENV || 'development';

// neccessary for finding some relative paths in the config file
config.__dirname = path.join(__dirname, '../../config');

switch (command) {
  case "dev":
    console.log(`\x1b[36mStarting Mavi ${version} ${mode}\x1b[0m`);
    script = path.join(__dirname, `../../index.js`);
    require(script).createServer(config);
  case "apply":
    console.log(`\x1b[36mLooking for changes...\x1b[0m`);
    script = path.join(__dirname, `../src/commands/apply-models.js`);
    require(script);
    break;
  case "remove":
    console.log(`\x1b[36mRemoving Models...\x1b[0m`);
    script = path.join(__dirname, `../src/commands/remove-models.js`);
    require(script);
    break;
  case "recreate":
    console.log(`\x1b[36mSchema recreated\x1b[0m`);
    script = path.join(__dirname, `../src/commands/reset-schema.js`);
    require(script);
    break;
  case "start":
  default:
    console.log(`\x1b[36mStarting Mavi ${version} ${mode}...\x1b[0m`);

    console.log(`\x1b[36mApplying Models...\x1b[0m`);
    script = path.join(__dirname, `../src/commands/apply-models.js`);
    require(script);

    script = path.join(__dirname, `../../dist/index.js`);
    require(script).createServer(config);
    break;
}

