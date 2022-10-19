class LedAnimation {
    constructor(title, minAmount){
        this.title = title;
        this.minAmount = minAmount;
        this.animation = function(){};
        this.active = false;
    }

    /**
     *
     * @param {LedInterface} ledInterface
     * @param args
     */
    play(ledInterface, args) {
        //play this animation
        this.active = true;
        this.animation(ledInterface, args, this);
    }
    stop(ledInterface) {
        this.active = false;
        ledInterface.clearAll();
    }

    setAnimation(func){
        this.animation = func;
    }
}

module.exports = LedAnimation;