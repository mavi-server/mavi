#!/usr/bin/env node

const path = require("path")
const config = require(path.join(process.cwd(), './index.js'))
const command = process.argv[2]
const { version } = require(path.join(__dirname, '../../package.json'))
let script

// neccessary for finding some relative paths in the config file
config.__dirname = path.join(__dirname, '../../config')

if (!config) {
  console.log('No config file found. Please create a config file at ./index.js')
  process.exit(1)
}

switch (command) {
  case "dev":
    console.log(`\x1b[36mStarting Sub Module Blue Server ${version} ${process.env.NODE_ENV}...\x1b[0m`)
    script = path.join(__dirname, `../../index.js`)
    require(script).createServer(config)
  case "apply":
    console.log(`\x1b[36mApplying Models...\x1b[0m`)
    script = path.join(__dirname, `../src/commands/apply-models.js`)
    require(script)
    break;
  case "remove":
    console.log(`\x1b[36mRemoving Models...\x1b[0m`)
    script = path.join(__dirname, `../src/commands/remove-models.js`)
    require(script)
    break;
  case "start":
  default:
    console.log(`\x1b[36mStarting Blue Server ${version} ${process.env.NODE_ENV}...\x1b[0m`)

    console.log(`\x1b[36mApplying Models...\x1b[0m`)
    script = path.join(__dirname, `../src/commands/apply-models.js`)
    require(script)

    script = path.join(__dirname, `../../dist/index.js`)
    require(script).createServer(config)
    break;
}

