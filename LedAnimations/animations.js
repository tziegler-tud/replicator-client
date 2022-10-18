const LedAnimation = require("./LedAnimation.js");

let ready = new LedAnimation("ready", 12);
ready.setAnimation(function(ledInterface, args, self){
    let leds = ledInterface.getLeds();
    ledInterface.setAll({
        color: {
            r: 255,
            g: 255,
            b: 255,
        },
        brightness: 0.1,
    });
    ledInterface.write();
})

let wake = new LedAnimation("ready", 12);
ready.setAnimation(function(ledInterface, args, self){
    let leds = ledInterface.getLeds();
    ledInterface.setAll({
        color: {
            r: 0,
            g: 0,
            b: 255,
        },
        brightness: 0.1,
    });
    ledInterface.write();
})

module.exports = {ready, wake};