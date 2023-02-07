/**
 * @class
 * @constructor
 * @param title {String}
 * @param minAmount {Number} NOT IMPLEMENTED the minimal number of leds needed to play this animation. If the interface does not provide enough LEDs, the animation is not played.
 */
export default class LedAnimation {
    constructor(title, minAmount){
        this.title = title;
        this.minAmount = minAmount;
        this.animation = function(){};
        this.active = false;
    }

    /**
     * plays an animation. Note that there are animations that do not finish by themselves, but have to be stopped or overwritten.
     * @param {LedInterface} ledInterface
     * @param args
     * @returns Promise<> Promise is resolved after the animation finished playing.
     */
    play(ledInterface, args) {
        let defaultArgs = {
            amount: 0,
        }
        args = Object.assign(defaultArgs, args);
        //play this animation
        this.active = true;
        this.amount = args.amount;
        return this.animation(ledInterface, args, this);
    }

    /**
     * stops the current animation and tells the interface to clear all LEDs.
     * @param ledInterface
     */
    stop(ledInterface) {
        this.active = false;
        ledInterface.clearAll();
    }

    /**
     * sets the animation function. This function must return a promise that is pending while the animation plays, and resolved when the animation finishes.
     * @param func
     */
    setAnimation(func){
        this.animation = func;
    }
}
