import Interface from "./Interface.js";
import rpio from'rpio';

rpio.init( {
    gpiomem: false,
})

/**
 * class DisplayInterface
 * @class
 * @param {Integer} ledAmount
 * @param {Number} [clockDivider]
 * @constructor
 */
export default class DisplayInterface extends Interface {
    constructor () {

        super();
        /**
         *
         * @type {Led[]}
         */
        this.leds = [];

        /**
         *
         * @type {Promise<DisplayInterface|Error>}
         */
        this.init = this.initFunc();
    }

    /**
     *
     * @returns {Promise<DisplayInterface|Error>}
     */
    initFunc(){
        let self = this;
        return new Promise(function(resolve, reject){

            self.isActive = true;
            resolve(self);
        })
    }
}



