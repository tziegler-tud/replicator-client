/**
 * @typedef ColorObject {Object}
 * @property r {Number} red value, 0<=r<=255
 * @property g {Number} green value, 0<=r<=255
 * @property b {Number} blue value, 0<=r<=255
 */

/**
 * class LedInterface
 * @class
 * @param ledInterface {LedInterface} assigned interface
 * @param id {Number} LED Id, assigned by the interface
 * @constructor
 */
export default class Led {
    constructor(ledInterface, id) {
        /**
         * @type {LedInterface}
         */
        this.ledInterface = ledInterface;
        /**
         * @type {Number}
         */
        this.id = id;
        /**
         * @type {ColorObject}
         */
        this.color = {
            r: 0,
            g: 0,
            b: 0,
        }
        /**
         * @type {boolean}
         */
        this.state = false;
        /**
         * the last set brighness before the LED was turned off
         * @type {number} 0 <= x <= 1
         */
        this.lastBrightness = 0.1;
        /**
         * the current brightness setting
         * @type {number} 0 <= x <= 1
         */
        this.brightness = 0;
        /**
         * @type {Buffer}
         */
        this.buffer = Buffer.alloc(4, 'E0000000', 'hex');
    }

    /**
     * sets the color of the led
     * @param color {ColorObject}
     */
    setColor (color){
        this.color.r = color.r;
        this.color.g = color.g;
        this.color.b = color.b
        this.writeColorsToBuffer()
    }

    /**
     *
     * @returns {Buffer}
     */
    writeColorsToBuffer (){
        this.buffer[1] = this.color.b;
        this.buffer[2] = this.color.g;
        this.buffer[3] = this.color.r;
        return this.buffer;
    }

    /**
     * turns an LED on, using the object brightness or lastBrightness properties
     */
    on () {
        if(this.state && this.brightness !== 0) {

        }
        else {
            if(this.brightness !== 0) {
                //state is false
                this.state = true;
            }
            else {
                //brightness 0
                this.state = true;
                this.setBrightness(this.lastBrightness);
            }
        }
    }

    /**
     * turns an LED off
     */
    off () {
        this.state = false;
        this.brightness = 0;
        this.lastBrightness = this.brightness;
        this.setBrightnessRaw(0);
    }

    /**
     * sets the brightness
     * @param brightness {Number} Value between 0 and 1
     */
    setBrightness (brightness) {
        if (brightness < 0) brightness = 0;
        if (brightness > 1) brightness = 1;
        this.brightness = brightness;
        this.buffer[0] = this.getBrightnessValue() | 0b11100000;
    }

    /**
     * sets the raw brightness value, which is a 5-bit bin value. Function accepts decimal numbers 0 <= x <= 31
     * @param brightness {Number}
     * @private
     */
    setBrightnessRaw (brightness) {
        this.buffer[0] = brightness | 0b11100000;
    }

    /**
     * write the current buffer to the interface
     */
    writeToInterface (){
        this.ledInterface.setBuffer(this.id, this.buffer);
    }

    /**
     * parse the current set brightness to a 5-bit value
     * @returns {number} 0<= x <= 31
     */
    getBrightnessValue () {
        return Math.ceil(this.brightness * 31);
    }
}
