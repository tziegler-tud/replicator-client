import Interface from "../interfaces/ReplicatorInterface.js";
import LedInterface from "../interfaces/LedInterface.js";
import SoundInterface from "../interfaces/SoundInterface.js";
import DisplayInterface from "../interfaces/DisplayInterface.js";

import interfaceConfig from "../config/interface.json" assert { type: 'json' };
import Service from "./Service.js";

/**
 * @typedef InterfaceConfig
 * @property {InterfaceConfigObject[]} interfaces
 */

/**
 * @typedef InterfaceConfigObject
 * @property type {String}
 * @property constructorArgs {Object}
 */


/**
 * @class
 * @constructor
 * Singleton
 */
class InterfaceService extends Service {
    constructor(init=false){
        super();
        let self = this;
        this.name = "InterfaceService";


        /**
         *
         * @type {{type: String, interface: ReplicatorInterface}[]}
         */
        this.interfaces = [];
        /**
         *
         * @type {LedInterface}
         */
        this.ledInterface = undefined;
        /**
         *
         * @type {SoundInterface}
         */
        this.soundInterface = undefined;
        /**
         *
         * @type {DisplayInterface}
         */
        this.displayInterface = undefined;
        /**
         *
         * @type {InterfaceConfig}
         */
        this.interfaceConfig = interfaceConfig
    }

    initFunc(){
        return new Promise((resolve, reject) => {
            console.log("Initializing InterfaceService...");
            let errMsg = "Failed to initialize InterfaceService:";
            //load config
            if(Array.isArray(this.interfaceConfig.interfaces)) {
                let loaderPromises = [];
                this.interfaceConfig.interfaces.forEach(interfaceConfigObject => {
                    loaderPromises.push(this.loadInterfaceFromConfig(interfaceConfigObject));
                })
                Promise.all(loaderPromises)
                    .then(result => {
                        console.log("load promises resolved")
                        resolve();
                    })
                    .catch(err => {
                        console.error("Failed to load interfaces");
                        fail(err.toString());
                    })
            }
            else {
                fail("Corrupted config file.");
            }

            function fail(message = "") {
                const msg = errMsg + message;
                console.warn(msg);
                let err = new Error(msg);
                reject(err);
            }
        })
    }

    /**
     *
     * @param interfaceConfigObject {InterfaceConfigObject}
     * @returns {Promise<unknown>}
     */
    loadInterfaceFromConfig(interfaceConfigObject){
        let self = this;
        const errMsg = "Failed to load interface: "
        return new Promise(function(resolve, reject){
            //convert to object if single string is given
            if(typeof interfaceConfigObject === "string" || typeof interfaceConfigObject === "String") {
                interfaceConfigObject = {type: interfaceConfigObject}
            }
            //validate
            let type = interfaceConfigObject.type;
            if(!type) reject(errMsg + "No valid type given");
            //load interface
            let p = new Promise(function(){});
            switch(type) {
                case self.types.LED:
                    p = self.addLedInterface(interfaceConfigObject.constructorArgs);
                    break;
                case self.types.SOUND:
                    p = self.addSoundInterface(interfaceConfigObject.constructorArgs);
                    break;
                case self.types.DISPLAY:
                    p = self.addDisplayInterface(interfaceConfigObject.constructorArgs);
                    break;
                default:
                case self.types.GENERIC:
                    p = self.addGenericInterface(interfaceConfigObject.constructorArgs);
                    break;
            }
            p.then(i => {
                console.log(type + " loaded successfully.")
                resolve(i);
            }).catch(err => {
                console.warn(errMsg + " Failed to call interface constructor.")
                reject(err);
                })
        })
    }
    handleEventAll(interfaceEvent, interfaceFilter){
        this.interfaces.forEach(i => {
            if(i.interface.active()) {
                i.interface.handleEvent(interfaceEvent)
                    .then(result => {

                    })
                    .catch(err => {
                        console.error("Failed to handle Event: " + err)
                    })
            }
        })
    }

    handleEvent(interfaceEvent, interfaceFilter){
        //apply filter
        let interfaces = this.filterInterfaces(interfaceFilter);
        interfaces.forEach(i => {
            if(i.interface.active()) {
                i.interface.handleEvent(interfaceEvent)
                    // .then(result => {
                    //
                    // })
                    // .catch(err => {
                    //     console.error("Failed to handle Event: " + err)
                    // })
            }
        })
    }

    /**
     *
     * @param interfaceFilter {Object}
     * @param interfaceFilter.type {String} include or exclude. Note that include + empty filter returns all results, while exclude + empty returns no results
     * @returns {{type: String, interface: ReplicatorInterface}[]}
     */
    filterInterfaces(interfaceFilter={type: "include", filter: []}){
        let filter = [];
        if(!Array.isArray(interfaceFilter.filter)){
            try {
                //try converting to string. Ideally, it should already be a string
                filter = [interfaceFilter.filter.toString()];
            }
            catch(e) {
                console.warn("Failed to process filter: Invalid argument received.")
            }
        }
        else {
            filter = interfaceFilter.filter;
        }

        switch(interfaceFilter.type){
            default:
            case "include":
                if(filter.length === 0) {
                    //empty include filter. return all results;
                    return this.interfaces;
                }
                else {
                    return this.interfaces.filter(i => {
                        return filter.includes(i.type)
                    })
                }
                break;
            case "exclude":
                if(filter.length === 0) {
                    //empty exclude filter. return no results;
                    return [];
                }
                else {
                    return this.interfaces.filter(i => {
                        return !filter.includes(i.type)
                    })
                }
                break;
        }
    }

    addLedInterface({constructorArgs={}, overwrite=false}={}){
        const type = this.types.LED;
        return new Promise((resolve, reject) => {
            if(this.getInterfaceByType(type)) {
                console.warn("Warning: " + type + "already added.");
                if(!overwrite) reject();
                console.warn("Overwriting " + type);
            }
            let ledInterface = new LedInterface(constructorArgs);
            ledInterface.init
                .then(ledIf=> {
                    console.log(type + " added");
                    this.ledInterface = ledInterface;
                    this.interfaces.push({type: type, interface: ledInterface})
                    resolve(ledInterface);

                })
                .catch(err => {
                    console.warn(err);
                    reject(err)
                })
        })
    }

    addSoundInterface({constructorArgs={}, overwrite=false}={}){
        const type = this.types.SOUND;
        return new Promise((resolve, reject) => {
            if(this.getInterfaceByType(type)) {
                console.warn("Warning: " + type + "already added.");
                if(!overwrite) reject();
                console.warn("Overwriting " + type);
            }
            let soundInterface = new SoundInterface(constructorArgs);
            soundInterface.init
                .then(soundIf=> {
                    console.log(type + " added");
                    this.soundInterface = soundInterface;
                    this.interfaces.push({type: type, interface: soundInterface})
                    resolve(soundInterface);
                })
                .catch(err => {
                    console.warn(err);
                    reject(err)
                })
        })
    }

    addDisplayInterface({constructorArgs={}, overwrite=false}={}){
        const type = this.types.DISPLAY;
        return new Promise((resolve, reject) => {
            if(self.getInterfaceByType(type)) {
                console.warn("Warning: " + type + "already added.");
                if(!overwrite) reject();
                console.warn("Overwriting " + type);
            }
            let displayInterface = new DisplayInterface(constructorArgs);
            displayInterface.init
                .then(dispIf=> {
                    console.log(type + " added");
                    this.displayInterface = displayInterface;
                    this.interfaces.push({type: type, interface: displayInterface})
                    resolve(displayInterface);
                })
                .catch(err => {
                    console.warn(err);
                    reject(err)
                })
        })
    }

    addGenericInterface({constructorArgs={}, overwrite=false}={}){
        let self = this;
        return new Promise(function(resolve, reject){
            //dummy
            let genericInterface = new Interface(constructorArgs);
            resolve();
        })
    }

    /**
     *
     * @param {InterfaceType} type
     * @returns ReplicatorInterface
     */
    getInterfaceByType(type){
        switch(type) {
            case this.types.LED:
                return this.ledInterface
            case this.types.SOUND:
                return this.soundInterface
            case this.types.DISPLAY:
                return this.displayInterface
            default:
                return undefined;
        }
    }


    /**
     *
     * @returns {SoundInterface}
     */
    getSoundInterface(){
        return this.soundInterface
    }

    getLedInterface(){
        return this.ledInterface;
    }

    getAll(){
        return this.interfaces;
    }

    events = {
        SETUPCOMPLETE: "setupComplete",
        READY: "ready",
        WAKE: "wake",
        UNDERSTOOD: "understood",
        WORKING: "working",
        NOTUNDERSTOOD: "notUnderstood",
        FAILED: "failed",
        SUCCESS: "success",
    }

    /**
     * @typedef InterfaceType
     * @type {{DISPLAY: string, SOUND: string, STDOUT: string, LED: string}}
     */
    types = {
        LED: "LedInterface",
        SOUND: "SoundInterface",
        DISPLAY: "DisplayInterface",
        GENERIC: "GenericInterface",
    }
}

export default new InterfaceService();