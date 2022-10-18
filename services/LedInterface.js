var rpio = require('rpio');
var {ready, wake} = require("../LedAnimations/animations.js")

/**
 * class LedInterface
 * @param {Integer} ledAmount
 * @param {Number} [clockDivider]
 * @constructor
 */
function LedInterface (ledAmount, clockDivider) {
    let self = this;
    this.isActive = false;
    clockDivider = typeof clockDivider !== 'undefined' ? clockDivider : 200
    let ledBufferLength = ledAmount * 4;
    this.ledBuffer = Buffer.alloc(ledBufferLength, 'E0000000', 'hex')
    this.bufferLength = 4 + ledBufferLength + 4;
    this.startFrame = Buffer.alloc(4, '00000000', 'hex');
    this.endFrame = Buffer.alloc(4, 'ff', 'hex')

    this.leds = []
    for (let i = 0; i++; i<ledAmount) {
        self.leds.push(new Led(i));
    }

    this.ledBuffer = this.generateLedBuffer();
    this.writeBuffer = this.generateWriteBuffer();

    rpio.init( {
        gpiomem: false,
    })
    //set GPIO5 to high
    rpio.open(29, rpio.OUTPUT, rpio.HIGH);
    rpio.spiBegin();
    rpio.spiChipSelect(0);
    rpio.spiSetCSPolarity(0, rpio.LOW);
    rpio.spiSetClockDivider(clockDivider);
    this.isActive = true;
}


LedInterface.prototype.close = function(){
    rpio.spiEnd();
}
LedInterface.prototype.write = function () {
    let writeBuffer = this.generateWriteBuffer()
    rpio.spiWrite(writeBuffer, writeBuffer.length);
}

LedInterface.prototype.generateLedBuffer = function(){
    let ledBufferArray = []
    this.leds.forEach(led => {
        ledBufferArray.push(led.buffer);
    })
    this.ledBuffer = Buffer.concat(ledBufferArray);
    return this.ledBuffer;
}

LedInterface.prototype.generateWriteBuffer = function(){
    this.ledBuffer = this.generateLedBuffer();
    this.writeBuffer = Buffer.concat([this.startFrame, this.writeBuffer, this.endFrame], this.bufferLength);
    return this.writeBuffer;
}

LedInterface.prototype.play = function(animationTitle){
    let self = this;
    switch(animationTitle) {
        case "ready":
            ready.play(self,{})
            break;
        case "wake":
            wake.play(self, {})
            break;
        case "understood":
            break;
        case "working":
            break;
        case "notunderstood":
            break;
        case "failed":
            break;
    }
}

// LedInterface.prototype.setLedColor = function (n, brightness, r, g, b) {
//     n *= 4
//     n += 4
//     this.writeBuffer[n] = brightness | 0b11100000
//     this.writeBuffer[n + 1] = b
//     this.writeBuffer[n + 2] = g
//     this.writeBuffer[n + 3] = r
// }

LedInterface.prototype.setAll = function(args) {
    let color = args.color;
    let brightness = args.brightness;
    this.leds.forEach(function(led){
        led.setColor(color);
        led.setBrightness(brightness)
    })
}

LedInterface.prototype.clearAll = function(){
    this.leds.forEach(led => {
        led.off();
    })
}

LedInterface.prototype.getLeds = function()  {
    return this.leds;
}

function Led (id) {
    this.id = id;
    this.color = {
        r: 0,
        g: 0,
        b: 0,
    }
    this.state = false;
    this.lastBrightness = 1;
    this.brightness = 0;
    this.buffer = Buffer.alloc(4, 'E0000000', 'hex');

}

Led.prototype.setColor = function(color){
    this.color.r = color.r;
    this.color.g = color.g;
    this.color.b = color.b
    this.writeColorsToBuffer()
}

Led.prototype.writeColorsToBuffer = function(){
    this.buffer[1] = this.color.b;
    this.buffer[2] = this.color.g;
    this.buffer[3] = this.color.r;
    return this.buffer;
}

Led.prototype.on = function() {
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

Led.prototype.off = function() {
   this.state = false;
   this.lastBrightness = this.brightness;
   this.setBrightness(0);
}


Led.prototype.off = function() {
    this.state = false;
    this.setBrightness(this.brightness);
}

Led.prototype.setBrightness = function(brightness) {
    if (brightness < 0) brightness = 0;
    if (brightness > 1) brightness = 1;
    this.brightness = brightness;
    this.buffer[0] = this.getBrightnessRaw() | 0b11100000;
}

Led.prototype.getBrightnessRaw = function() {
    return Math.ceil(this.brightness * 31);
}

module.exports = LedInterface;
