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

console.log("Connecting to MongoDB instance at " + config.connectionString + "...");
mongoose.connect(config.connectionString,opt)
    .then(result => {
        console.log("Database connection successfull.")
    })
    .catch(err => {
        console.error("Failed to connect to Database: " + err);
    })
mongoose.Promise = global.Promise;

import Server from "./serverScheme.js"
import Settings from "./settingsScheme.js"
let db = {
    Server: Server,
    Settings: Settings
}
export default db;