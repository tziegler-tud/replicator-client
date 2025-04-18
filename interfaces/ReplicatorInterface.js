/**
 * @class
 * @constructor
 *
 * @param isActive {Boolean}
 * @param init {Promise<ReplicatorInterface|Error>}
 */
export default class ReplicatorInterface {
    constructor() {
        /**
         *
         * @type {boolean}
         */
        this.isActive = false;
    }

    /**
     *
     * @returns {Promise<Interface|Error>}
     */
    initFunc() {
        let self = this;
        return new Promise(function (resolve, reject) {
            self.isActive = true;
            resolve(self);
        })
    }

    /**
     * do something via the interface
     * @param eventTitle {String}
     * @param args {Object}
     * @param {Number} args.amount
     * @returns {*}
     */
    handleEvent (eventTitle, args={}){
        if(!this.isActive) return new Promise(function(resolve, reject){
            reject("Interface inactive.")
        })
        if(this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
        console.log("trying to handle event: " + eventTitle)
        let self = this;
        switch(eventTitle) {
            case "setupComplete":

                break;
            case "ready":

                break;
            case "wake":

                break;
            case "understood":
                break;
            case "working":

                break;
            case "notunderstood":

                break;
            case "failed":

                break;
            case "success":

                break;
        }
    }

    /**
     * returns true if the interface is active
     * @returns {boolean}
     */
    active(){
        return this.isActive
    }

    activate(){
        this.isActive = true;
    }

    deactivate(){
        this.isActive = false;
        if(this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
    }
}