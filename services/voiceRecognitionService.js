import { Picovoice } from "@picovoice/picovoice-node";
import { PvRecorder } from "@picovoice/pvrecorder-node";


import picoVoiceConfig from "../config/picovoice.json" assert { type: 'json' };
import VoiceCommandService from "./voiceCommandService.js";
import InterfaceService from "./InterfaceService.js";

/**
 * Voice Recognition Service
 * @class
 *
 */
export default class VoiceRecognitionService {
    /**
     * @constructor
     * @param args
     * @param {Number} args.recorderDeviceIndex
     * @returns {VoiceRecognitionService}
     */
    constructor({recorderDeviceIndex=-1}={}){
        this.mutex = false;
        this.recorderDeviceIndex = undefined;
        this.picoVoiceConfig = picoVoiceConfig;
        /**
         *
         * @type {PvRecorder}
         */
        this.recorder = this.addRecorder(recorderDeviceIndex);
        /**
         *
         * @type {InterfaceService}
         */
        this.interface = InterfaceService.getInstance();
        /**
         *
         * @type {VoiceCommandService}
         */
        this.voiceCommandService = VoiceCommandService.getInstance();
        return this;
    }


    // noinspection JSValidateTypes
    /**
     *
     * @param recorderDeviceIndex
     * @returns {PvRecorder}
     */
    addRecorder(recorderDeviceIndex = -1) {
        let self = this;
        const keywordCallback = function (keyword) {
            console.log("wake word detected");
            self.voiceCommandService.processKeyword(keyword, self);
        };

        const inferenceCallback = function (inference) {
            console.log("Inference:");
            console.log(JSON.stringify(inference, null, 4));

            //we have detected a voice command. Forward to command handler
            self.voiceCommandService.processCommand(inference);

        };
        //initalize new picovoice rt-obj
        this.picovoice= new Picovoice(
            self.picoVoiceConfig.accessKey,
            self.picoVoiceConfig.keywordArgument,
            keywordCallback,
            self.picoVoiceConfig.contextPath,
            inferenceCallback
        );
        // noinspection JSValidateTypes
        return new PvRecorder(recorderDeviceIndex, this.picovoice.frameLength);
    }

    /**
     * starts the voice Recognition Service
     */
    start() {
        let self = this;
        async function startRecorder() {
            self.recorder.start();
            console.log("Listening for 'COMPUTER'");
            self.interface.handleEvent(self.interface.events.SETUPCOMPLETE);
            while (1) {
                const frames = await self.recorder.read();
                self.picovoice.process(frames);
            }
        }
        if(self.recorder){
            startRecorder()
                .then(result => {
                    console.log("running");
                })
                .catch(e=> {
                    console.error(e);
                })
        }
        else {
            console.error("Failed to start recorder: Recorder not initialized.");
        }
    };
    stop() {
        this.recorder.stop();
    };


}
