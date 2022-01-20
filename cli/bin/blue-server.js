#!/usr/bin/env node

const path = require("path")
const config = require(path.join(process.cwd(), './index.js'))

let script
let command = process.argv[2]

if (!config) {
  console.log('No config file found. Please create a config file at ./index.js')
  process.exit(1)
}

switch (command) {
  case "start":
    script = path.join(__dirname, `../../dist/index.js`)
    require(script).createServer(config)
    break;
  case "start-as-dev":
    script = path.join(__dirname, `../../index`)
    require(script).createServer(config)
    break;
  case "apply":
    script = path.join(__dirname, `../src/commands/apply-models.js`)
    require(script)
    break;
  default:
    console.log("Unknown command: " + command)
    process.exit(1)
}

