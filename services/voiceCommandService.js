//this class takes the voice command object from picovoice and processes it


/**
 * @typedef VoiceCommandObject
 * @property isUnderstood {Boolean} true if the command was understood
 * @property intent {String} intend class descriptor
 * @property slots {Object} dynamic object containing the variables defined by the rhino model. Check model description for docs
 */

class VoiceCommandService {
    constructor(intentManager){
        this.intentManager = intentManager;
        this.mutex = false;
        VoiceCommandService.setInstance(this);
        return this;
    }
    static _instance;

    static getInstance() {
        if (this._instance) {
            return this._instance;
        }
        else {
            console.log("Cannot get instance: Instance does not exists.");
            return undefined;
        }
    }
    static createInstance(intentManager) {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new VoiceCommandService(intentManager);
        return this._instance;
    }

    static setInstance(instance) {
        this._instance = instance;
        return this._instance;
    }

    processKeyword(keyword, location) {
        //check if location has LEDs
        if(location.ledInterface.isActive) {
            location.ledInterface.play("wake");
        }
    }

    /**
     *
     * @param command {VoiceCommandObject}
     * @param location {Location}
     */
    processCommand(command, location){
        //check if understood
        if(!command.isUnderstood) {
            //not understood. nothing we can do
            if(location.ledInterface.isActive) {
                location.ledInterface.play("notunderstood");
            }
            return false;
        }
        else {
            if(location.ledInterface.isActive) {
                location.ledInterface.play("working");
            }
            //get intent
            let title = command.intent;
            //retrieve matching intent
            let intent = this.intentManager.getIntent(title);
            //determine which variables are set
            //first, retrieve intent variables
            let intentVariables = intent.variables;
            //these are the variables we can expect. now, lets check which ones we have:
            let commandVariables = command.slots; //is an object, the keys are variable names
            //now, let the intent check its handlers. It returns an array. If its empty, no handlers qualified
            let matchingHandlers = intent.checkHandlers( command.slots);
            if(matchingHandlers.length>0) {
                //it's a match!
                //run the handlers
                matchingHandlers.forEach(function(handler){
                    handler.run(command.slots, location)
                })
                if(location.ledInterface.isActive) {
                    location.ledInterface.play("success");
                }

            }
            else {
                //no handler found
                if(location.ledInterface.isActive) {
                    location.ledInterface.play("failed");
                }
            }




        }
    }
}

module.exports = VoiceCommandService;