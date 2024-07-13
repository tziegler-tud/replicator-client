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
class ServerActionService extends Service {
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

    handle(data){
        return new Promise((resolve, reject) => {
            this.init.then(()=>{
                let msg = "Failed to execute command:";
                const soundInterface = InterfaceService.getInterfaceByType(InterfaceService.types.SOUND);
                switch(data.command){
                    case "playSoundLocal":
                        if(soundInterface.interface.active()) {
                            soundInterface.interface.playFilename(data.filename, {duration: data.duration, delay: data.delay});
                            resolve();
                        }
                        else reject("SoundInterface disabled.")
                        break;
                    case "playAudioStream":
                        if(soundInterface.interface.active()) {
                            soundInterface.playAudioStream(data.url)
                        }
                        else reject("SoundInterface disabled.")
                        break;
                    default:
                        break;
                }
                const res = TcpResponseGenerator.tpcResponse.COMMAND.SUCCESSFULL;
                resolve(res)
            })
        })
    }
}

export default new ServerActionService();
