const { Picovoice } = require("@picovoice/picovoice-node");
const PvRecorder = require("@picovoice/pvrecorder-node");

const picoVoiceConfig = require("../config/picovoice-pi.json");
const VoiceCommandService = require("./voiceCommandService");
const LedInterface = require("../interfaces/LedInterface.js");

/**
 * @typedef {Object} LightGroupObject
 * @property {Integer} id  light id as assigned by hue bridge
 * @property {string} name  group name as assigned by hue bridge.
 */

/**
 * Location class
 * @class
 * @constructor
 * @alias Location_
 *
 * @property {LightGroupObject[]} lightGroups
 */
class Location {
    /**
     *
     * @param identifier {string}
     */
    constructor(identifier){
        let self = this;
        this.recorderDeviceIndex = undefined;
        this.identifier = identifier;
        this.recorder = undefined;
        this.voiceCommandService = VoiceCommandService.getInstance();
        this.picoVoiceConfig = picoVoiceConfig;
        this.ledInterface = {};

        /** @type {LightGroupObject[]} */
        this.lightGroups = [];
        this.lights = [];
    }

    addLedInterface(ledAmount){
        let self = this;
        this.ledInterface = new LedInterface(ledAmount);
        this.ledInterface.init
            .then(ledIf=> {
                console.log("LED interface set up for Location: " + self.identifier);

            })
            .catch(err => {
                console.warn(err);
            })
    }


    addRecorder(recorderDeviceIndex) {
        let self = this;
        if(recorderDeviceIndex === undefined) {
            recorderDeviceIndex = -1;
        }
        const keywordCallback = function (keyword) {
            console.log(`wake word detected for location: ` + self.identifier);
            self.voiceCommandService.processKeyword(keyword, self);
        };

        const inferenceCallback = function (inference) {
            console.log("bind test: " + self.identifier)
            console.log("Inference:");
            console.log(JSON.stringify(inference, null, 4));

            //we have detected a voice command. Forward to command handler
            self.voiceCommandService.processCommand(inference, self);

        };
        //initalize new picovoice rt-obj
        this.picovoice= new Picovoice(
            self.picoVoiceConfig.accessKey,
            self.picoVoiceConfig.keywordArgument,
            keywordCallback,
            self.picoVoiceConfig.contextPath,
            inferenceCallback
        );
        this.recorder = new PvRecorder(recorderDeviceIndex, this.picovoice.frameLength);
    }

    start() {
        let self = this;
        async function startRecorder() {
            self.recorder.start();
            console.log("Listening for 'COMPUTER' in " + self.identifier + "...");
            if(self.ledInterface.isActive){
                self.ledInterface.play("setupComplete", {amount: 1})
                    .then(function(){
                        self.ledInterface.play("ready")
                    })
            }
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
            console.error("Failed to start recorder for location "+ self.identifier +": Recorder not initialized.");
        }
    };
    stop() {
        this.recorder.stop();
    };


}

module.exports = Location;