import Interface from "./Interface.js";
// import Speaker from 'speaker';
// import audioApi from 'web-audio-engine';
import rpio from'rpio';
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import child_process from 'node:child_process';
// import Audic from "audic";
// const AudioContext = audioApi.StreamAudioContext;

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

        // this.speaker = new Speaker({
        //     channels: 2,          // 2 channels
        //     bitDepth: 16,         // 16-bit samples
        //     sampleRate: 44100     // 44,100 Hz sample rate
        // });
        // this.context      = new AudioContext();
        // this.audio = new WritableStream();
        // this.context.pipe(this.speaker);
        // this.context.outStream = this.audio;
        //
        // this.context.outStream = process.stdout

        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        this.soundDirPath = path.join(__dirname, '..', 'data', 'sounds');
        //
        this.sounds = {
            SETUPCOMPLETE: "power_up1_clean.wav",
            READY: "power_up1_clean.wav",
            WAKE: "communications_start_transmission.wav",
            FAIL: "fail.wav",
            NOTUNDERSTOOD: "notunderstood.wav",
            SUCCESS: "communications_end_transmission.wav",
        }

        this.files  = {
            SETUPCOMPLETE: path.join(this.soundDirPath, this.sounds.SETUPCOMPLETE),
            READY: path.join(this.soundDirPath, this.sounds.READY),
            WAKE: path.join(this.soundDirPath, this.sounds.WAKE),
            FAIL: path.join(this.soundDirPath, this.sounds.FAIL),
            NOTUNDERSTOOD: path.join(this.soundDirPath, this.sounds.NOTUNDERSTOOD),
            SUCCESS: path.join(this.soundDirPath, this.sounds.SUCCESS),
        }
        this.audioData = {

        }

        this.init = this.initFunc();



        //
        // this.audic = {
        //     SETUPCOMPLETE: new Audic(path.join(soundDirPath, this.sounds.SETUPCOMPLETE)),
        //     READY: new Audic(path.join(soundDirPath, this.sounds.READY)),
        //     WAKE: new Audic(path.join(soundDirPath, this.sounds.WAKE)),
        // }

    }

    decode(filepath){
        let self = this;
        // return new Promise(function(resolve, reject) {
        //     fs.readFile(filepath, function(err, data) {
        //         if (err) {
        //             console.error("Failed to read file: " + filepath);
        //             reject();
        //         }
        //         else {
        //             self.context.decodeAudioData(data)
        //                 .then(audioBuffer => {
        //                     resolve(audioBuffer)
        //                     })
        //                 .catch(err => {
        //                     reject(err);
        //                 })
        //         }
        //     })
        // })
    }

    /**
     *
     * @returns {Promise<SoundInterface|Error>}
     */
    initFunc(){
        let self = this;
        return new Promise(function(resolve, reject){
            // const setup = self.decode(path.join(self.soundDirPath, self.sounds.SETUPCOMPLETE));
            // const ready = self.decode(path.join(self.soundDirPath, self.sounds.READY));
            // const wake = self.decode(path.join(self.soundDirPath, self.sounds.WAKE));
            //
            // Promise.all([setup, ready, wake])
            //     .then(results => {
            //         self.audioData = {
            //             SETUPCOMPLETE: results[0],
            //             READY: results[1],
            //             WAKE: results[2],
            //         }
            //         self.is
            //     })
            //     .catch(err => {
            //         reject(err);
            //     })

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
        if(!this.isActive) return new Promise(function(resolve, reject){
            reject("Interface inactive.")
        })
        if(this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }
        console.log("SoundInterface: Trying to handle event: " + eventTitle)
        let self = this;
        switch(eventTitle) {
            case "setupComplete":
                // return self.playSoundAudic(self.audic.SETUPCOMPLETE);
                return self.play(self.files.SETUPCOMPLETE);
                break;
            case "ready":
                // return self.playSoundAudic(self.audic.READY);
                return self.play(self.files.READY);
                break;
            case "wake":
                // return self.playSoundAudic(self.audic.WAKE);
                return self.play(self.files.WAKE);
                break;
            case "understood":
                break;
            case "working":

                break;
            case "notunderstood":
                return self.play(self.files.NOTUNDERSTOOD);
                break;
            case "failed":
                return self.play(self.files.FAIL);
                break;
            case "success":
                return self.play(self.files.SUCCESS);
                break;
        }
    }

    // async playSoundAudic(audic){
    //     // let self = this;
    //     // await audic.play();
    //     // audic.addEventListener("ended", () => {
    //     //     // audic.destroy();
    //     // })
    // }
    //
    // playSound(filename){
    //     let self = this;
    //     const __dirname = path.dirname(fileURLToPath(import.meta.url));
    //     let filepath = path.join(__dirname, '..', 'systemStore', 'sounds', filename);
    //
    //     return new Promise(function(resolve, reject){
    //         fs.readFile(filepath, function(err, data){
    //             if(err) {
    //                 console.error("Failed to read file: " + filepath);
    //                 reject();
    //             }
    //             else {
    //                 // self.context.decodeAudioData(data, function(audioBuffer) {
    //
    //                     // self.context.outStream = new Speaker({
    //                     //     channels:   self.context.format.numberOfChannels,
    //                     //     bitDepth:   self.context.format.bitDepth,
    //                     //     sampleRate: self.context.sampleRate
    //                     // });
    //                 //     self.context.outStream = process.stdout;
    //                 //     // self.play(audioBuffer);
    //                 //     resolve();
    //                 // });
    //             }
    //         });
    //
    //
    //     })
    //
    // }

    // play(path){
    //     this._playViaAplay("", path);
    // }

    playAudioStream(url, {duration, delay}={}){
        this._stream(url, {duration, delay});
    }

    playFilename(filename, {duration, delay}={}){
        this.play(path.join(this.soundDirPath, filename), {duration, delay});
    }

    play(path, {duration, delay}={}){
        let args = "";
        if(duration > 0) args += "-d " + duration
        if(delay > 0){
            setTimeout(()=>{
                this._play(args, path)
            }, delay*1000)
        }
        else {
            this._play(args, path)
        }
    }

    _play(args, path){
        child_process.exec('aplay ' + args + " " + path);
    }

    _stream(src, args){
        child_process.exec('curl ' + src + ' | aplay ' + args);
    }
}



