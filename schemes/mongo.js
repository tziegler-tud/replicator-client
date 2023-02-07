import config from '../config/db.json' assert { type: 'json' };
import mongoose from 'mongoose';
mongoose.set('debug', false);

var opt = {
    user: config.username,
    pass: config.pwd,
    auth: {
        authSource: config.authSource
    },
};

mongoose.connect(config.connectionString,opt);  // use this for remote database
mongoose.Promise = global.Promise;

import Server from "./serverScheme.js"
import Settings from "./settingsScheme.js"
let db = {
    Server: Server,
    Settings: Settings
}
export default db;