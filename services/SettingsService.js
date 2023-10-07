import fs from "fs";
import * as fsPromises from 'node:fs/promises';

import systemSettings from "../config/systemSettings.json" assert { type: 'json' };
import path from "path";
import {fileURLToPath} from "url";
import {getObjectProp, setObjectProp} from "../helpers/utils.js";
import VoiceRecognitionService from "./voiceRecognitionService.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @class
 * @constructor
 * Singleton
 */
class SettingsService {
    constructor(init = false) {
        let self = this;
        this.initStarted = false;
        this.status = this.statusEnum.NOTSTARTED;

        this.init = new Promise(function (resolve, reject) {
            self.resolveInit = resolve;
            self.rejectInit = reject;
        })

        this.debugLabel = "SettingsService: ";
        this.settings = {};
        this.defaultSettings = {
            system: {
                debugLevel: 0
            },
            recording: {
                porcupineSensitivity: 0.6,
                rhinoSensitivity: 0.7,
                endpointDurationSec: 0.6,
            }
        }
        return this;
    }

    start(args){
        let self = this;
        this.initStarted = true;
        this.initFunc(args)
            .then(result => {
                self.status = self.statusEnum.RUNNING;
                self.resolveInit();
            })
            .catch(err => {
                self.status = self.statusEnum.FAILED;
                self.rejectInit();
            });
        return this.init;
    }

    initFunc(args) {
        let self = this;
        return new Promise(function (resolve, reject) {
            console.log("Loading settings...");
            let errMsg = "Failed to initialize SettingsService:";

            //read user settings
            self.settings = systemSettings;

            //try to load file from systemStore
            self.load()
                .then(result=> {
                    self.settings = Object.assign(self.defaultSettings, result, systemSettings)
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
        this.settings = params;
        return this.save();
    }

    save(){
        let self  = this;
        return new Promise(function(resolve, reject){
            const content = JSON.stringify(self.settings);
            //check if systemStore dir exists
            const storePath = path.join(__dirname, '..', "/systemStore");
            const filePath = path.join(storePath, "systemSettings.json");
            fs.access(storePath, error => {
                if (error) {
                    fs.mkdirSync(storePath);
                    write();
                }
                else {
                    write();
                }

                function write() {
                    fsPromises.writeFile(filePath, content, 'utf8')
                        .then(result => {
                            resolve()
                        })
                        .catch(err => {
                            reject(err);
                        })
                }

            });
        })

    }

    load(){
        let self = this;
        return new Promise(function (resolve, reject) {
            const storePath = path.join(__dirname, '..', "/systemStore");
            const filePath = path.join(storePath, "systemSettings.json");
            fs.readFile(filePath, 'utf8', function (err, data) {
                if (err) {
                    reject(err);
                }
                else {
                    const obj = JSON.parse(data);
                    resolve(obj);
                }
            });
        })
    }

    getSettings() {
        return this.settings;
    }

    getKey(key){
        if(!key) return undefined;
        return getObjectProp(this.settings, key);
    }

    set({key, value}={}){
        if(!key) return false;
        setObjectProp(this.settings, value, key);
        // this.settings[key] = value;
        this.save();
        //restart recorder
        VoiceRecognitionService.restart();
        return this.settings;
    }

    statusEnum = {
        NOTSTARTED: 0,
        RUNNING: 1,
        STOPPED: 2,
        FAILED: 3,
    }
}

export default new SettingsService();