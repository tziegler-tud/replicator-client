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
        this.initStarted = false;
        this.status = this.statusEnum.NOTSTARTED;

        this.init = new Promise(function (resolve, reject) {
            self.resolveInit = resolve;
            self.rejectInit = reject;
        })

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
        let self = this;
        this.initStarted = true;
        SettingsService.init.then(settings => {
            this.initFunc(args)
                .then(result => {
                    self.status = self.statusEnum.RUNNING;
                    self.resolveInit();
                })
                .catch(err => {
                    self.status = self.statusEnum.FAILED;
                    self.rejectInit();
                });
        })
        return this.init;
    }

    /**
     * stops the service
     */
    stop(){
        this.stopService()
            .then(()=>{
                this.status = this.statusEnum.STOPPED;
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

    statusEnum = {
        NOTSTARTED: 0,
        RUNNING: 1,
        STOPPED: 2,
        FAILED: 3,
    }
}