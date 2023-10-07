import { Picovoice } from "@picovoice/picovoice-node";
import { PvRecorder } from "@picovoice/pvrecorder-node";


import picoVoiceConfig from "../config/picovoice.json" assert { type: 'json' };
import VoiceCommandService from "./voiceCommandService.js";
import SettingsService from "./SettingsService.js";
import InterfaceService from "./InterfaceService.js";
import Service from "./Service.js";
import TcpResponseGenerator from "../helpers/tcpResponseGenerator.js";

/**
 * Executes server-sent commands on the client
 * @class
 *
 */
class ServerCommandService extends Service {
    /**
     * @constructor
     * @returns {ServerCommandService}
     */
    constructor(){
        super();
        this.name = "ServerCommandService";
        return this;
    }

    /**
     * starts the voice Recognition Service
     */
    initFunc() {
        let self = this;
        this.recorderSettings = this.systemSettings.recording;
        return new Promise(function(resolve, reject) {
            resolve();
        })

    };

    processCommand(data){
        return new Promise((resolve, reject) => {
            this.init.then(()=>{
                let msg = "Failed to execute command:";
                switch(data.command){
                    case "disableAudio":
                        this.disableAudio();
                        break;
                    case "enableAudio":
                        this.enableAudio();
                        break;
                    case "disableLed":
                        this.disableLed();
                        break;
                    case "enableLed":
                        this.enableLed();
                        break;
                    case "disableDisplay":
                        this.disableDisplay();
                        break;
                    case "enableDisplay":
                        this.enableDisplay();
                        break;
                    default:
                        break;
                }
                const res = TcpResponseGenerator.tpcResponse.COMMAND.SUCCESSFULL;
                resolve(res)
            })
        })
    }

    disableAudio(){
        this.disableInterface(InterfaceService.types.SOUND)
    }

    enableAudio(){
        this.enableInterface(InterfaceService.types.SOUND)
    }

    disableLed(){
        this.disableInterface(InterfaceService.types.LED)
    }

    enableLed(){
        this.enableInterface(InterfaceService.types.LED)
    }

    disableDisplay(){
        this.disableInterface(InterfaceService.types.SOUND)
    }

    enableDisplay(){
        this.enableInterface(InterfaceService.types.DISPLAY)
    }

    disableInterface(type){
        const i = InterfaceService.getInterfaceByType(type);
        if(i) i.interface.deactivate();
    }

    enableInterface(type){
        const i = InterfaceService.getInterfaceByType(type);
        if(i) i.interface.activate();
    }



}

export default new ServerCommandService();
