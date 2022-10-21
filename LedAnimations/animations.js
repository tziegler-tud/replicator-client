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
        brightness: 0.1,
    })
    ledInterface.write();
    let circleFrames = circle(ledInterface, 0, 1);
    ledInterface.interval = setInterval(function(){
        circleFrames.nextFrame()
            .then(function(){
                ledInterface.write();
            })
    }, 100)
})

let setup = new LedAnimation("setup", 1);
setup.setAnimation(function(ledInterface, args, self){
    return new Promise(function(resolve, reject){
        let leds = ledInterface.getLeds();
        let i = 0;
        ledInterface.setAll({
            color: {
                r: 0,
                g: 255,
                b: 0,
            },
            brightness: 0,
        })
        ledInterface.write();
        let fillingCircleFrames = fillingCircle(ledInterface, 0, 0.1);
        ledInterface.interval = setInterval(function(){
            fillingCircleFrames.nextFrame()
                .then(function(){
                    i++;
                    ledInterface.write();
                    if (i===ledInterface.ledAmount) {
                        clearInterval(ledInterface.interval);
                        setTimeout(function(){
                            resolve();
                        },1000);
                    }
                })
        }, 100)
    })
})

let success = new LedAnimation("success", 1);
success.setAnimation(function(ledInterface, args, self){
    return new Promise(function(resolve, reject){
        let leds = ledInterface.getLeds();
        let i = 0;
        ledInterface.setAll({
            color: {
                r: 0,
                g: 255,
                b: 0,
            },
            brightness: 0,
        })
        ledInterface.write();
        let fillingCircleFrames = fillingCircle(ledInterface, 0, 0.1);
        ledInterface.interval = setInterval(function(){
            fillingCircleFrames.nextFrame()
                .then(function(){
                    i++;
                    ledInterface.write();
                    if (i===ledInterface.ledAmount) {
                        clearInterval(ledInterface.interval);
                        setTimeout(function(){
                            resolve();
                        },500);
                    }
                })
        }, 50)
    })
})


let fail = new LedAnimation("fail", 1);
fail.setAnimation(function(ledInterface, args, self){
    return new Promise(function(resolve, reject){
        let leds = ledInterface.getLeds();
        let i = 0;
        ledInterface.setAll({
            color: {
                r: 255,
                g: 0,
                b: 0,
            },
            brightness: 0.2,
        })
        ledInterface.write();
        clear(ledInterface,200);
        setAll(ledInterface, {color: {
                r: 255,
                g: 0,
                b: 0,
            },
            brightness: 0.2,},
            400)
        clear(ledInterface,600);
        setTimeout(function(){
            resolve();
        },800)
    })
})

animations.ready = ready;
animations.wake = wake;
animations.working = working;
animations.setup = setup;
animations.success = success;
animations.fail = fail;


var clear = function(ledInterface, delay){
    setTimeout(function(){
        ledInterface.setAll({
            color: {
                r: 0,
                g: 0,
                b: 0,
            },
            brightness: 0,
        });
        ledInterface.write();
    }, delay);
}
var setAll = function(ledInterface, setObject, delay){
    setTimeout(function(){
        ledInterface.setAll(setObject);
        ledInterface.write();
    }, delay);
}

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

var circle = function(ledInterface, startBrightness, endBrightness){
    let index = 0;
    let maxIndex = ledInterface.ledAmount -1;
    let leds = ledInterface.getLeds();
    let range = endBrightness - startBrightness;
    let step = range / 2;
    ledInterface.setAll({color:{r:0,g:0,b:255}, brightness: 0});

    function left(index, amount) {
        let val = index - amount;
        if(val >= 0) return val
        else return maxIndex - amount +1;

    }

    return {
        nextFrame: function(){
            return new Promise(function(resolve, reject){
                // ledInterface.setAll({color:{r:0,g:0,b:0}, brightness: 0});
                index = (index+1) % (maxIndex+1);
                //enable two left and right as well
                leds[index].setBrightness(endBrightness);
                leds[(index +1) % (maxIndex +1)].setBrightness(endBrightness - step);
                leds[left(index,1)].setBrightness(endBrightness - step);
                //clear previous
                leds[left(index, 2)].setBrightness(startBrightness);
                resolve()
            });
        }
    }
}

var fillingCircle =  function(ledInterface, startBrightness, endBrightness){
    let index = 0;
    let maxIndex = ledInterface.ledAmount -1;
    let leds = ledInterface.getLeds();
    let range = endBrightness - startBrightness;
    let step = range / 2;
    // ledInterface.setAll({color:{r:0,g:0,b:255}, brightness: 0});

    function left(index, amount) {
        let val = index - amount;
        if(val >= 0) return val
        else return maxIndex - amount +1;

    }

    return {
        nextFrame: function(){
            return new Promise(function(resolve, reject){
                index = (index+1) % (maxIndex+1);
                //enable two left and right as well
                leds[index].setBrightness(endBrightness);
                resolve()
            });
        }
    }
}
module.exports = animations;