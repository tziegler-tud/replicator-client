const LedAnimation = require("./LedAnimation.js");
var animations = {}

let ready = new LedAnimation("ready", 12);
ready.setAnimation(function(ledInterface, args, self){
    let leds = ledInterface.getLeds();
    ledInterface.setAll({
        color: {
            r: 0,
            g: 0,
            b: 0,
        },
        brightness: 0,
    });
    ledInterface.write();
})

let wake = new LedAnimation("wake", 12);
wake.setAnimation(function(ledInterface, args, self){
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

let working = new LedAnimation("wake", 12);
working.setAnimation(function(ledInterface, args, self){
    let leds = ledInterface.getLeds();
    let i = 0;
    ledInterface.setAll({
        color: {
            r: 0,
            g: 0,
            b: 255,
        },
        brightness: 0,
    })
    ledInterface.write();
    // pulse(leds[0], 0, 0.2, 5000, 100,0)

    // leds.forEach(function(led, index){
    //     // pulse(led, 0, 0.2, 5000, 10,index*100)
    //     // flash(led, 0.2, 0, 1000, 100,index*100)
    // })
    // let interval = setInterval(function(){
    //     ledInterface.write();
    //     // console.log("writing spi...")
    // }, 50);
    let circleFrames = circle(ledInterface, 5000, 500, 0, 1);
    ledInterface.interval = setInterval(function(){
        circleFrames.nextFrame()
            .then(function(){
                ledInterface.write();
            })
    }, 200)
})

let clear = new LedAnimation("ready", 12);
clear.setAnimation(function(ledInterface, args, self){
    let leds = ledInterface.getLeds();
    ledInterface.setAll({
        color: {
            r: 0,
            g: 0,
            b: 0,
        },
        brightness: 0,
    });
    ledInterface.write();
})


animations.ready = ready;
animations.wake = wake;
animations.working = working;
// animations.success = success;
// animations.fail = fail;

var pulse = function(led, startBrightness, endBrightness, cyclePeriod, stepDuration, startDelay){
    let minStep = 10;
    if(stepDuration < minStep) stepDuration = minStep;
    //slowly raise brightness to endBrightness in half the cycle Period
    let halfCycleTime = Math.round(cyclePeriod/2);
    //calculate amount of steps
    let stepAmount = halfCycleTime / stepDuration;
    let stepBrightness = (endBrightness - startBrightness) / stepAmount;
    led.setBrightness(startBrightness);
    let currentBrightness = startBrightness;
    setTimeout(function() {
        led.interval = setInterval(function(){
            currentBrightness = currentBrightness + stepBrightness;
            if(currentBrightness > endBrightness || currentBrightness < startBrightness) {
                //revert
                stepBrightness = -1 * stepBrightness
                currentBrightness = currentBrightness + 2*stepBrightness;
            }
            led.setBrightness(currentBrightness);
        }, stepDuration)
    }, startDelay)
}

var flash = function(led, startBrightness, endBrightness,  cyclePeriod, duration, startDelay){
    led.setBrightness(startBrightness);
    let currentBrightness = startBrightness;
    setTimeout(function() {
        led.interval = setInterval(function(){
            led.setBrightness(endBrightness);
            setTimeout(function(){
                led.setBrightness(startBrightness)
            }, duration)
        }, cyclePeriod);
    }, startDelay)
}

var circle = function(ledInterface, cyclePeriod, duration, startBrightness, endBrightness){
    let index = 0;
    let maxIndex = ledInterface.ledAmount -1;
    let leds = ledInterface.getLeds();
    let range = endBrightness - startBrightness;
    let step = range / 2;

    function left(index, amount) {
        let val = index - amount;
        if(val >= 0) return val
        else return maxIndex - amount +1;

    }

    return {
        nextFrame: function(){
            return new Promise(function(resolve, reject){
                ledInterface.setAll({color:{r:0,g:0,b:0}, brightness: 0});
                index = (index+1) % (maxIndex+1);
                //enable two left and right as well
                leds[index].setBrightness(endBrightness);
                leds[(index +1) % (maxIndex +1)].setBrightness(endBrightness - step);
                leds[left(index,1)].setBrightness(endBrightness - step);
                resolve()
            });
        }
    }
}
module.exports = animations;