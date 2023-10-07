import SettingsService from "./SettingsService.js";
/**
 * @class
 * @abstract
 * Abstract Service class.
 * Implementations of this class should expose a singleton instance to the app, useable by imports.
 * Module export of such a class should be a new instance.
 */
export default class Service {
    constructor(){
        let self = this;
        this.name = "unidentified Service";
        this.initStarted = false;
        this.status = this.statusEnum.NOTSTARTED;

        this.init = new Promise(function (resolve, reject) {
            self.resolveInit = resolve;
            self.rejectInit = reject;
        })

        this.systemSettings = undefined;
        this.debugLabel = "Service: ";
        this.enableDebug = true;
    }

    debug(message, level=1) {
        if(SettingsService.getSettings().system.debugLevel <= level) console.log(this.debugLabel + message);
    }

    /**
     * start the service
     * @param args {Object} Arguments object forwarded to the initialization function.
     */
    start(args){
        console.log("Starting Service: " + this.name)
        if(this.status === this.statusEnum.RUNNING) {
            return new Promise((resolve, reject)=> {resolve(this.statusEnum.RUNNING)});
        }
        else {
            let self = this;
            this.initStarted = true;
            SettingsService.init.then(settings => {
                this.systemSettings = SettingsService.getSettings();
                this.initFunc(args)
                    .then(result => {
                        self.status = self.statusEnum.RUNNING;
                        self.resolveInit(self.status);
                    })
                    .catch(err => {
                        self.status = self.statusEnum.FAILED;
                        self.rejectInit(self.status);
                    });
            })
            return this.init;
        }
    }

    /**
     * stops the service
     */
    stop(){
        console.log("Stopping Service: " + this.name)
        const self = this;
        return new Promise((outerResolve, outerReject)=> {
            this.stopService()
                .then(()=>{
                    this.status = this.statusEnum.STOPPED;
                    this.init = new Promise(function (resolve, reject) {
                        self.resolveInit = resolve;
                        self.rejectInit = reject;
                    })
                    outerResolve(self.status);
                })
                .catch(err => {
                    outerReject(err);
                })
        })
    }


    async initFunc(){
        //implemented by child classes
        return true;
    }

    async stopService(){
        //implemented by child classes
        return true;
    }

    getState(){
        return {
            status: this.status,
        }
    }

    statusEnum = {
        NOTSTARTED: 0,
        RUNNING: 1,
        STOPPED: 2,
        FAILED: 3,
    }
}