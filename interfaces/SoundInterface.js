import Interface from "./Interface.js";
// import Speaker from 'speaker';
// import audioApi from 'web-audio-api';
import rpio from'rpio';
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import Audic from "audic";

rpio.init( {
    gpiomem: false,
})

/**
 * class SoundInterface
 * @class
 * @param {Integer} ledAmount
 * @param {Number} [clockDivider]
 * @constructor
 */
export default class SoundInterface extends Interface {
    constructor () {

        super();

        /**
         *
         * @type {Promise<SoundInterface|Error>}
         */
        this.init = this.initFunc();

        // this.speaker = new Speaker({
        //     channels: 2,          // 2 channels
        //     bitDepth: 16,         // 16-bit samples
        //     sampleRate: 44100     // 44,100 Hz sample rate
        // });
        // this.context      = new audioApi.AudioContext();
        // this.audio = new WritableStream();
        // this.context.outStream = this.audio;

        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const soundDirPath = path.join(__dirname, '..', 'systemStore', 'sounds');

        this.sounds = {
            SETUPCOMPLETE: "power_up1_clean.wav",
            READY: "power_up1_clean.wav",
            WAKE: "communications_start_transmission.wav",
        }

        this.audic = {
            SETUPCOMPLETE: new Audic(path.join(soundDirPath, this.sounds.SETUPCOMPLETE)),
            READY: new Audic(path.join(soundDirPath, this.sounds.READY)),
            WAKE: new Audic(path.join(soundDirPath, this.sounds.WAKE)),
        }
    }

    /**
     *
     * @returns {Promise<SoundInterface|Error>}
     */
    initFunc(){
        let self = this;
        return new Promise(function(resolve, reject){

            self.isActive = true;
            resolve(self);
        })
    }

    /**
     * do something via the interface
     * @param eventTitle {String}
     * @param args {Object}
     * @param {Number} args.amount
     * @returns {*}
     */
    handleEvent (eventTitle, args={}){


        if(this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
        console.log("SoundInterface: Trying to handle event: " + eventTitle)
        let self = this;
        switch(eventTitle) {
            case "setupComplete":
                return self.playSoundAudic(self.audic.SETUPCOMPLETE);
                break;
            case "ready":
                return self.playSoundAudic(self.audic.READY);
                break;
            case "wake":
                return self.playSoundAudic(self.audic.WAKE);
                // return self.playSound(self.sounds.WAKE);
                break;
            case "understood":
                break;
            case "working":

                break;
            case "notunderstood":

                break;
            case "failed":

                break;
            case "success":

                break;
        }
    }

    async playSoundAudic(audic){
        let self = this;
        await audic.play();
        audic.addEventListener("ended", () => {
            // audic.destroy();
        })
    }

    playSound(filename){
        // let self = this;
        // const __dirname = path.dirname(fileURLToPath(import.meta.url));
        // let filepath = path.join(__dirname, '..', 'systemStore', 'sounds', filename);
        //
        // return new Promise(function(resolve, reject){
        //     fs.readFile(filepath, function(err, data){
        //         if(err) {
        //             console.error("Failed to read file: " + filepath);
        //             reject();
        //         }
        //         else {
        //             self.context.decodeAudioData(data, function(audioBuffer) {
        //
        //                 self.context.outStream = new Speaker({
        //                     channels:   self.context.format.numberOfChannels,
        //                     bitDepth:   self.context.format.bitDepth,
        //                     sampleRate: self.context.sampleRate
        //                 });
        //                 // self.context.outStream = process.stdout;
        //                 self.play(audioBuffer);
        //                 resolve();
        //             });
        //         }
        //     });
        //
        //
        // })

    }

    // play(audioBuffer) {
    //     if (!audioBuffer) { return; }
    //     var bufferSource = this.context.createBufferSource();
    //     bufferSource.connect(this.context.destination);
    //     bufferSource.buffer = audioBuffer;
    //     bufferSource.loop   = false;
    //     bufferSource.start(0);
    // }
}



