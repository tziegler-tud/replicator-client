const { Picovoice } = require("@picovoice/picovoice-node");
const PvRecorder = require("@picovoice/pvrecorder-node");

const picoVoiceConfig = require("../config/picovoice2.json");
const VoiceCommandService = require("./voiceCommandService");

const LightsService = require("./LightsService");
const lightsService = LightsService.getInstance();

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

        /** @type {LightGroupObject[]} */
        this.lightGroups = [];
    }



    addRecorder(recorderDeviceIndex) {
        let self = this;
        if(recorderDeviceIndex === undefined) {
            recorderDeviceIndex = -1;
        }
        const keywordCallback = function (keyword) {
            console.log(`wake word detected for location: ` + self.identifier);
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

    /**
     * adds a hue light group
     * @param groupName {string} name of the group assigned by the hue bridge.
     */
    addLightGroup(groupName) {
        lightsService.getLightGroupIdByName(groupName)
            .then(id => {
                let o = {id: id, name: groupName};
                this.lightGroups.push(o);
                return o;
            })
            .catch(e => {
                return false
            });
    }
}

module.exports = Location;