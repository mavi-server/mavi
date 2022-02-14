// - if you make some changes, mavi will automatically assign hash to every file and its properties.
// - if you want to keep models sync with your database you shouldn't delete the hashes
// - if you change your model name, you should change the filenames too
// - be sure that referenced tables are ordered before the table that references them
exports.statuses = require('./statuses')
exports.customers = require('./customers')