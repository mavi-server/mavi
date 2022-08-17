module.exports = {
    utils: {
        glue: require('./src/utils/glue'),
        checkEnv: require('./src/utils/checkEnv'),
        schema: require('./src/utils/schema'),
    },
    actions: {
        build: require('./src/actions/build'),
        clear: require('./src/actions/clear'),
        drop: require('./src/actions/drop'),
        seed: require('./src/actions/seed'),
    }
}