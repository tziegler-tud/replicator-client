class LedAnimation {
    constructor(title, minAmount){
        this.title = title;
        this.minAmount = minAmount;
        this.animation = function(){};
    }

    /**
     *
     * @param {LedInterface} ledInterface
     * @param args
     */
    play(ledInterface, args) {
        //play this animation
        this.animation(ledInterface, args, this);
    }
    stop(ledInterface) {
        ledInterface.clearAll();
    }

    setAnimation(func){
        this.animation = func;
    }
}

module.exports = LedAnimation;