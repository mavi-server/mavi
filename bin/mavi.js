#!/usr/bin/env node

const command = process.argv[2]
const mode = process.env.NODE_ENV || 'development'
const readline = require('readline')
const cwd = process.cwd()
const { utils, actions } = require('../packages/cli')

/**
 * @type {import('../types').MaviConfig}
 */
// Validate mavi.config and combine it with the projection files
const config = utils.glue({ cwd })

// Mavi version
const { version } = require('../package.json')

// Assign default DB_STATE table name
if (!process.env.DB_STATE) {
    process.env.DB_STATE = 'mavi_db_state'
}

// Set required properties
config.workdir = cwd // set working directory: should be user's project directory
config.mode = mode // mavi environment

switch (command) {
    case '-v':
    case '--v':
    case '-version':
    case '--version':
    case 'version':
        console.log(`\x1b[36mmavi v${version}\x1b[0m`)
        process.exit(0)
    case 'dev':
    case 'start':
    default:
        if (command === 'dev') {
            const mavi = require('../index')
            mavi.createServer(config)
        } else {
            const mavi = require('mavi')
            mavi.createServer(config)
        }

        // log:
        console.log(`\x1b[36mStarting Mavi ${version} ${mode}...\x1b[0m`)

        // if not includes parameters, switch to the next command:
        const buildArguments = ['-build', '--build', '-b', '--b']
        if (!process.argv.find((arg) => buildArguments.find((c) => c === arg))) {
            break
        }
    case 'build': {
        // log:
        console.log(`\x1b[36mLooking for changes...\x1b[0m`)

        // check if 'no seed' argument provided
        const noSeed = Boolean(
            process.argv.find((arg) =>
                [
                    '-no-seed',
                    '-no-seeds',
                    '--no-seed',
                    '--no-seeds',
                    '-ns',
                    '--ns',
                ].find((c) => c === arg)
            )
        )

        // run:
        actions.build(config)
            .then(() => {
                console.log(`\x1b[36mBuild completed!\x1b[0m`)
            })
            .then(async () => {
                // Break the case if --no-seed indicated:
                if (!noSeed) {
                    // run:
                    await actions.seed(config).then(() => {
                        console.log(`\x1b[36mSeed completed!\x1b[0m`)
                        process.exit(0)
                    })
                }
            })
            .then(() => {
                // Build
                if (command === 'build') {
                    process.exit(0)
                }

                // else, start the server
            })

        break
    }
    case 'seed': {
        // run:
        actions.seed(config).then(() => {
            console.log(`\x1b[36mSeed completed!\x1b[0m`)
            process.exit(0)
        })
        break
    }
    case 'clear': {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })

        rl.question(
            `\x1b[31mClear all \x1b[36m${mode}\x1b[0m \x1b[31mdatabase?\x1b[0m (yes/no): `,
            (answer) => {
                if (answer.toLocaleLowerCase() === 'yes') {
                    // log:
                    console.log(`\x1b[31mClearing Tables...\x1b[0m`)

                    // run:
                    actions.clear(config).then(() => {
                        console.log(`\x1b[36mCleaning completed!\x1b[0m`)
                        process.exit(0)
                    })
                } else {
                    console.log('\x1b[36mAborting...\x1b[0m')
                    process.exit(0)
                }
            }
        )

        break
    }
    case 'drop': {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })

        rl.question(
            `\x1b[31mDrop all \x1b[36m${mode}\x1b[0m \x1b[31mdatabase?\x1b[0m (yes/no): `,
            (answer) => {
                if (answer.toLocaleLowerCase() === 'yes') {
                    // log:
                    console.log(`\x1b[31mDropping Models...\x1b[0m`)

                    // run:
                    actions.drop(config).then(() => {
                        console.log(`\x1b[36mDropping completed!\x1b[0m`)
                        process.exit(0)
                    })
                } else {
                    console.log('\x1b[36mAborting...\x1b[0m')
                    process.exit(0)
                }
            }
        )

        break
    }
}
