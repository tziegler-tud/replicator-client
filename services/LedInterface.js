var rpio = require('rpio');
var animations = require("../LedAnimations/animations.js")

rpio.init( {
    gpiomem: false,
})

/**
 * class LedInterface
 * @param {Integer} ledAmount
 * @param {Number} [clockDivider]
 * @constructor
 */
function LedInterface (ledAmount, clockDivider) {
    let self = this;
    this.isActive = false;
    this.ledAmount = ledAmount;
    this.clockDivider = clockDivider !== undefined ? clockDivider : 128

    this.leds = []
    this.init = this.init();


}

LedInterface.prototype.init = function(){
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
    this.writeBuffer = Buffer.concat([this.startFrame, this.ledBuffer, this.endFrame], this.bufferLength);
    return this.writeBuffer;
}

LedInterface.prototype.writeRaw = function(){
    // console.log("writing to interface")
    rpio.spiWrite(this.writeBuffer, this.writeBuffer.length);
}

LedInterface.prototype.setBuffer = function(ledIndex, buffer) {
    let pos = 4 + ledIndex * 4;
    this.writeBuffer[pos] = buffer[0];
    this.writeBuffer[pos+1] = buffer[1];
    this.writeBuffer[pos+2] = buffer[2];
    this.writeBuffer[pos+3] = buffer[3];
}

LedInterface.prototype.play = function(animationTitle){
    if(this.interval) {
        clearInterval(this.interval);
        this.interval = undefined;
    }
    console.log("trying to playing animation: " + animationTitle)
    let self = this;
    switch(animationTitle) {
        case "ready":
            animations.ready.play(self,{})
            break;
        case "wake":
            animations.wake.play(self, {})
            break;
        case "understood":
            break;
        case "working":
            animations.working.play(self, {})
            break;
        case "notunderstood":
            animations.ready.play(self, {})
            // animations.notunderstood.play(self, {})
            break;
        case "failed":
            // animations.fail.play(self, {})
            animations.ready.play(self, {})
            break;
        case "success":
            // animations.success.play(self, {})
            animations.ready.play(self, {})
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
        if(color) led.setColor(color);
        if(brightness) led.setBrightness(brightness)
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

function Led (ledInterface, id) {
    this.ledInterface = ledInterface;
    this.id = id;
    this.color = {
        r: 0,
        g: 0,
        b: 0,
    }
    this.state = false;
    this.lastBrightness = 0.1;
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
   this.brightness = 0;
   this.lastBrightness = this.brightness;
   this.setBrightnessRaw(0);
}

Led.prototype.setBrightness = function(brightness) {
    if (brightness < 0) brightness = 0;
    if (brightness > 1) brightness = 1;
    this.brightness = brightness;
    this.buffer[0] = this.getBrightnessValue() | 0b11100000;
}

Led.prototype.setBrightnessRaw = function(brightness) {
    this.buffer[0] = brightness | 0b11100000;
}

Led.prototype.writeToInterface = function(){
    this.ledInterface.setBuffer(this.id, this.buffer);
}

Led.prototype.getBrightnessValue = function() {
    return Math.ceil(this.brightness * 31);
}

module.exports = LedInterface;
