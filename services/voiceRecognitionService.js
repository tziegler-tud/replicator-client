import { Picovoice } from "@picovoice/picovoice-node";
import { PvRecorder } from "@picovoice/pvrecorder-node";


import picoVoiceConfig from "../config/picovoice.json" assert { type: 'json' };
import VoiceCommandService from "./voiceCommandService.js";
import SettingsService from "./SettingsService.js";
import InterfaceService from "./InterfaceService.js";
import Service from "./Service.js";

/**
 * Voice Recognition Service
 * @class
 *
 */
class VoiceRecognitionService extends Service {
    /**
     * @constructor
     * @param args
     * @param {Number} args.recorderDeviceIndex
     * @returns {VoiceRecognitionService}
     */
    constructor({recorderDeviceIndex=-1}={}){
        super();
        this.name = "VoiceRecognitionService";
        this.mutex = false;
        this.recorderDeviceIndex = recorderDeviceIndex;

        const defaultConfig = {

        }
        this.picoVoiceConfig = Object.assign(defaultConfig, picoVoiceConfig);


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
            VoiceCommandService.processKeyword(keyword, self);
        };

        const inferenceCallback = function (inference) {
            console.log("Inference:");
            console.log(JSON.stringify(inference, null, 4));

            //we have detected a voice command. Forward to command handler
            VoiceCommandService.processCommand(inference);

        };
        try {
            this.picovoice= new Picovoice(
                self.picoVoiceConfig.accessKey,
                self.picoVoiceConfig.keywordArgument,
                keywordCallback,
                self.picoVoiceConfig.contextPath,
                inferenceCallback,
                parseFloat(self.systemSettings.recording.porcupineSensitivity), //porcupine sensitivity
                parseFloat(self.systemSettings.recording.rhinoSensitivity), // rhino sensitivity
                parseFloat(self.systemSettings.recording.endpointDurationSec)
            );
        }
        catch(e){
            console.error(e);
            throw new Error(e);
        }
        //initalize new picovoice rt-obj

        // noinspection JSValidateTypes
        return new PvRecorder(this.picovoice.frameLength, recorderDeviceIndex);
    }

    /**
     * starts the voice Recognition Service
     */
    initFunc() {
        let self = this;
        this.recorderSettings = this.systemSettings.recording;
        return new Promise(function(resolve, reject) {

            /**
             *
             * @type {PvRecorder}
             */
            self.recorder = self.addRecorder(self.recorderDeviceIndex);
            async function startRecorder() {
                self.recorder.start();
                console.log("Listening for 'COMPUTER'");
                while (self.recorder.isRecording) {
                    try {
                        const frames = await self.recorder.read();
                        self.picovoice.process(frames);
                    }
                    catch(err) {
                        // self.stop();
                        console.log("Error while reading recorder: " + err);
                    }
                }
            }
            if(self.recorder){
                startRecorder();
                resolve();
            }
            else {
                const msg = "Failed to start recorder: Recorder not initialized.";
                console.error(msg);
                reject(msg);
            }
        })

    };
    stopService() {
        let self = this;
        return new Promise(function(resolve, reject){
            self.recorder.stop();
            resolve();
        })
    };

    async restart(){
        console.log("Stopping VoiceRecognitionService...")
        await this.stop()
        //update setting;
        this.systemSettings = SettingsService.getSettings();
        this.recorderSettings = this.systemSettings.recording;
        console.log("Starting VoiceRecognitionService...")
        try {
            const init = await this.start({});
            console.log("VoiceRecognitionService restarted successfully.")
            return this.status;
        }
        catch(err) {
            console.log("Failed to restart VoiceRecognitionService: " + err);
            return this.status;
        }
    }
}

export default new VoiceRecognitionService();
