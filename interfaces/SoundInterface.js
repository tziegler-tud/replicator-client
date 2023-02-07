import Interface from "./Interface.js";
import rpio from'rpio';

rpio.init( {
    gpiomem: false,
})

/**
 * class SoundInterface
 * @class
 * @param {Integer} ledAmount
 * @param {Number} [clockDivider]
 * @constructor
 */
export default class SoundInterface extends Interface {
    constructor () {

        super();
        /**
         *
         * @type {Led[]}
         */
        this.leds = [];

        /**
         *
         * @type {Promise<SoundInterface|Error>}
         */
        this.init = this.initFunc();
    }

    /**
     *
     * @returns {Promise<SoundInterface|Error>}
     */
    initFunc(){
        let self = this;
        return new Promise(function(resolve, reject){

            self.isActive = true;
            resolve(self);
        })
    }
}



