import fetch from 'node-fetch';
import db from '../schemes/mongo.js';
const Settings = db.Settings;

/**
 * @class
 * @constructor
 * Singleton
 */
export default class SettingsService {
    constructor(init = false) {
        let self = this;

        this.settings = {};
        this.initStarted = false;

        this.defaultSettings = {

        }

        this.init = new Promise(function (resolve, reject) {
            self.resolveInit = resolve;
            self.rejectInit = reject;
        })
        if (init) {
            this.initFunc();
        }
        return this;
    }

    static _instance;

    static getInstance() {
        if (this._instance) {
            return this._instance;
        } else {
            this._instance = new SettingsService();
            return this._instance;
        }
    }

    static createInstance(init = true) {
        if (this._instance) {
            if (!this._instance.initStarted && init) this._instance.startInit();
            return this._instance;
        }

        this._instance = new SettingsService(init);
        return this._instance;
    }

    static setInstance(instance) {
        this._instance = instance;
        return this._instance;
    }

    startInit() {
        let self = this;
        this.initStarted = true;
        this.initFunc()
            .then(result => {
                self.resolveInit();
            })
            .catch(err => {
                self.rejectInit();
            });
    }

    initFunc() {
        let self = this;
        return new Promise(function (resolve, reject) {
            console.log("Loading settings...");
            let errMsg = "Failed to initialize SettingsService:";

            //try to load from db
            self.load()
                .then(result=> {
                    self.settings = result;
                    resolve(result)
                })
                .catch(err=> {
                    //failed to load settings from db. Create a fresh one and save it
                    self.create()
                        .then( result=> {
                            resolve(result);
                        })
                        .catch(err => {
                            reject(err);
                        })
                })
        })
    }

    create(params) {
        let defaults = this.defaultSettings;
        params = Object.assign(defaults, params);
        params.identifier = params.identifier ? params.identifier : "Replicator-Client-" + Date.now();
        let settings = new Settings(params)
        this.settings = settings;
        return settings.save()
    }

    save(){
        return this.settings.save();
    }

    load(){
        let self = this;
        return new Promise(function (resolve, reject) {
            //check known servers in db
            Settings.findOne()
                .then(function(settings) {
                    if(!settings){
                        //no file found
                        reject("No settings document found in database");
                    }
                    self.settings = settings;
                    resolve(settings);
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    set({key, value}={}){
        if(!key) return false;
        this.settings[key] = value;
        return this.save();
    }
}
