//this class takes the voice command object from picovoice and processes it
import InterfaceService from "./InterfaceService.js";
import CommunicationService from "./CommunicationService.js";

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
export default class VoiceCommandService {
    constructor(){
        this.mutex = false;
        VoiceCommandService.setInstance(this);
        this.interface = InterfaceService.getInstance();
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
    static createInstance() {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new VoiceCommandService();
        return this._instance;
    }

    static setInstance(instance) {
        this._instance = instance;
        return this._instance;
    }

    processKeyword(keyword) {
        //notify InterfaceSerivce
        this.interface.handleEvent("wake");
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
            this.interface.handleEvent("notunderstood");
            return false;
        }
        else {
            this.interface.handleEvent("working");
            //get intent
            let title = command.intent;
            //these are the variables we can expect. now, lets check which ones we have:
            let commandVariables = command.slots; //is an object, the keys are variable names
            //send the command to the server
            CommunicationService.sendCommand(command);


        }
    }
}
