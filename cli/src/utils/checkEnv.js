const { resolve } = require('path');

// Env variables
require('dotenv').config({ path: resolve('.env') });

// DB_STATE is the table name for the state of the models
process.env.DB_STATE = process.env.DB_STATE || 'mavi_db_state';