//this class takes the voice command object from picovoice and processes it
import InterfaceService from "./InterfaceService.js";
import CommunicationService from "./CommunicationService.js";
import Service from "./Service.js";

/**
 * @typedef VoiceCommandObject
 * @property isUnderstood {Boolean} true if the command was understood
 * @property intent {String} intend class descriptor
 * @property slots {Object} dynamic object containing the variables defined by the rhino model. Check model description for docs
 */

/**
 * @class
 * @constructor
 * Singleton
 */
class VoiceCommandService extends Service {
    constructor(){
        super();
        this.mutex = false;
    }

    initFunc(){
        let self = this;
        return new Promise(function(resolve, reject){
            resolve();
        })
    }

    processKeyword(keyword) {
        //notify InterfaceSerivce
        InterfaceService.handleEvent("wake");
    }

    /**
     *
     * @param command {VoiceCommandObject}
     * @param location {Location}
     */
    processCommand(command){
        //check if understood
        if(!command.isUnderstood) {
            //not understood. nothing we can do
            InterfaceService.handleEvent("notunderstood");
            return false;
        }
        else {
            InterfaceService.handleEvent("working");
            //get intent
            let title = command.intent;
            //these are the variables we can expect. now, lets check which ones we have:
            let commandVariables = command.slots; //is an object, the keys are variable names
            //send the command to the server
            CommunicationService.sendCommand(command);


        }
    }
}

export default new VoiceCommandService();