import express from 'express';
var router = express.Router();

import SettingsService from "../../../services/SettingsService.js";
import VoiceRecognitionService from "../../../services/voiceRecognitionService.js";


/**
 * hooked at /api/v1/services
 */

router.get("/recorder", getRecorderState);
router.post("/recorder/stop", stopRecorder);
router.post("/recorder/start", startRecorder);
router.post("/recorder/restart", restartRecorder);

function getRecorderState (req, res, next){
    const state = VoiceRecognitionService.getState();
    res.json(state);
}

function stopRecorder (req, res, next){
    VoiceRecognitionService.stop()
        .then(result => {
            res.json(generateResponse(result))
        })

}

function startRecorder (req, res, next){
    VoiceRecognitionService.start()
        .then(result => {
            res.json(generateResponse(result))
        })
}

function restartRecorder (req, res, next){
    VoiceRecognitionService.restart()
        .then(result => {
            res.json(generateResponse(result))
        })
}


function generateResponse(status){
    let message = undefined;
    let error = null;
    switch(status) {
        case VoiceRecognitionService.statusEnum.FAILED:
            message = "Service failed.";
            break;
        case VoiceRecognitionService.statusEnum.RUNNING:
            message = "Service active";
            break;
        case VoiceRecognitionService.statusEnum.STOPPED:
            message = "Service stopped";
            break;
        case VoiceRecognitionService.statusEnum.NOTSTARTED:
            message = "Service not initialised";
            break;
    }
    return {status: message, error: error};
}
export default router;