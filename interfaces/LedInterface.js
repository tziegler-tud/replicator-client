import Interface from "./Interface.js";
import rpio from'rpio';
import animations from "../LedAnimations/animations.js";

import Led from "./Led.js";
import ReplicatorInterface from "./ReplicatorInterface.js";

rpio.init( {
    gpiomem: false,
})

/**
 * class LedInterface
 * @class
 * @param {Integer} ledAmount
 * @param {Number} [clockDivider]
 * @constructor
 */
export default class LedInterface extends ReplicatorInterface {
    constructor ({ledAmount=12, clockDivider=128}) {

        super();
        /**
         * @type {Integer}
         */
        this.ledAmount = ledAmount;

        /**
         * @type {Number}
         */
        this.clockDivider = clockDivider;
        /**
         *
         * @type {Led[]}
         */
        this.leds = [];

        /**
         *
         * @type {Promise<LedInterface|Error>}
         */
        this.init = this.initFunc();
    }

    /**
     *
     * @returns {Promise<LedInterface|Error>}
     */
    initFunc(){
        let self = this;
        return new Promise(function(resolve, reject){
            for (let i = 0;i<self.ledAmount; i++) {
                self.leds.push(new Led(self, i));
            }
            let ledBufferLength = self.ledAmount * 4;
            self.ledBuffer = Buffer.alloc(ledBufferLength, 'E0000000', 'hex')
            self.bufferLength = 4 + ledBufferLength + 4;
            self.startFrame = Buffer.alloc(4, '00000000', 'hex');
            self.endFrame = Buffer.alloc(4, 'ff', 'hex')
            self.ledBuffer = self.generateLedBuffer();
            self.writeBuffer = self.generateWriteBuffer();
            //set GPIO5 to high
            rpio.open(29, rpio.OUTPUT, rpio.HIGH);
            rpio.spiBegin();
            rpio.spiChipSelect(1);
            rpio.spiSetCSPolarity(0, rpio.LOW);
            rpio.spiSetClockDivider(self.clockDivider);
            self.isActive = true;
            resolve(self);
        })
    }

    /**
     * closes the spi Connection
     */
    close (){
        rpio.spiEnd();
    }

    /**
     * write the current buffer to the spi interface
     */
    write () {
        let writeBuffer = this.generateWriteBuffer()
        rpio.spiWrite(writeBuffer, writeBuffer.length);
    }

    /**
     * genererates the combined led Buffer using the current led buffers of the assigned LEDs
     * @returns {Buffer}
     */
    generateLedBuffer (){
        let ledBufferArray = []
        this.leds.forEach(led => {
            ledBufferArray.push(led.buffer);
        })
        this.ledBuffer = Buffer.concat(ledBufferArray);
        return this.ledBuffer;
    }

    /**
     *
     * @returns {Buffer}
     */
    generateWriteBuffer (){
        this.ledBuffer = this.generateLedBuffer();
        this.writeBuffer = Buffer.concat([this.startFrame, this.ledBuffer, this.endFrame], this.bufferLength);
        return this.writeBuffer;
    }

    writeRaw (){
        // console.log("writing to interface")
        rpio.spiWrite(this.writeBuffer, this.writeBuffer.length);
    }

    setBuffer (ledIndex, buffer) {
        let pos = 4 + ledIndex * 4;
        this.writeBuffer[pos] = buffer[0];
        this.writeBuffer[pos+1] = buffer[1];
        this.writeBuffer[pos+2] = buffer[2];
        this.writeBuffer[pos+3] = buffer[3];
    }

    /**
     * plays an Animation via the interface
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
        console.log("trying to playing animation: " + eventTitle)
        let self = this;
        switch(eventTitle) {
            case "setupComplete":
                return animations.setup.play(self,args)
                break;
            case "ready":
                return animations.ready.play(self,args)
                break;
            case "wake":
                return animations.wake.play(self, args)
                break;
            case "understood":
                break;
            case "working":
                return animations.working.play(self, args)
                break;
            case "notunderstood":
                return animations.notunderstood.play(self, args)
                break;
            case "failed":
                // animations.fail.play(self, {})
                return animations.fail.play(self, args)
                break;
            case "success":
                // animations.success.play(self, {})
                return animations.success.play(self, args)
                break;
        }
    }

    /**
     * sets the status of all LEDs
     * @param args {Object}
     * @param {ColorObject} args.color color Object
     * @param {Number} args.brightness 0<= x <= 1
     */
    setAll (args={}) {
        let color = args.color;
        let brightness = args.brightness;
        this.leds.forEach(function(led){
            if(color) led.setColor(color);
            if(brightness) led.setBrightness(brightness)
        })
    }

    /**
     * sets all LEDs to off
     */
    clearAll (){
        this.leds.forEach(led => {
            led.off();
        })
    }

    /**
     * returns all LEDs
     * @returns {Led[]}
     */
    getLeds ()  {
        return this.leds;
    }
}



