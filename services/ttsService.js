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
class ttsService extends Service {
    /**
     * @constructor
     * @returns {ttsService}
     */
    constructor(){
        super();
        this.name = "ttsService";
        return this;
    }

    /**
     * starts the service
     */
    initFunc() {
        let self = this;
        return new Promise(function(resolve, reject) {
            resolve();
        })
    };
}

export default new ttsService();
