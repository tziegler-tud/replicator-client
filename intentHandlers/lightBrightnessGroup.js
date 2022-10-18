const IntentHandler = require("./intentHandler");
const LightsService = require("../services/LightsService");
const LocationManager = require("../services/LocationManager");

const lightsService = LightsService.getInstance();

var lightBrightnessGroup = []

const h1 = new IntentHandler();
h1.addVariable("setValue", "setValue", IntentHandler.EXPECTATION.REQUIRED);
h1.addVariable("toBy", "absoluteRelative", IntentHandler.EXPECTATION.REQUIRED);
h1.addVariable("percent", "pv.Percent", IntentHandler.EXPECTATION.REQUIRED);
h1.addVariable("location", "location", IntentHandler.EXPECTATION.FORBIDDEN);
h1.setHandlerFunction(function(variables, location, handler){
    let defaults = {

    }
    variables = Object.assign(defaults, variables);
    //change state of lights in current location
    let parsedVars = parseVariables(variables)
    return setBrightnessAllGroups(location.lightGroups,parsedVars.percentValue, parsedVars.isRelative);
})

lightBrightnessGroup.push(h1);

const h2 = new IntentHandler();
h2.addVariable("setValue", "setValue", IntentHandler.EXPECTATION.REQUIRED);
h2.addVariable("toBy", "absoluteRelative", IntentHandler.EXPECTATION.REQUIRED);
h2.addVariable("percent", "pv.Percent", IntentHandler.EXPECTATION.REQUIRED);
h2.addVariable("location", "location", IntentHandler.EXPECTATION.REQUIRED);
h2.setHandlerFunction(function(variables, location, handler){
    let defaults = {
    }
    variables = Object.assign(defaults, variables);
    let variableLocation = LocationManager.getInstance().getLocation(variables.location);
    let parsedVars = parseVariables(variables)
    return setBrightnessAllGroups(variableLocation.lightGroups,parsedVars.percentValue, parsedVars.isRelative);
})
lightBrightnessGroup.push(h2);

const h5 = new IntentHandler();
h5.addVariable("setValue", "setValue", IntentHandler.EXPECTATION.REQUIRED);
h5.addVariable("minmax", "minmax", IntentHandler.EXPECTATION.REQUIRED);
h5.addVariable("location", "location", IntentHandler.EXPECTATION.OPTIONAL);
h5.setHandlerFunction(function(variables, location, handler){
    let parsedVars = parseVariables(variables)
    if(variables.location) {
        location = LocationManager.getInstance().getLocation(variables.location);
    }
    return setBrightnessAllGroups(location.lightGroups,parsedVars.minmax, false);
})
lightBrightnessGroup.push(h5);

const h6 = new IntentHandler();
h6.addVariable("setValue", "setValue", IntentHandler.EXPECTATION.REQUIRED);
h6.addVariable("location", "location", IntentHandler.EXPECTATION.OPTIONAL);
h6.addVariable("toBy", "absoluteRelative", IntentHandler.EXPECTATION.FORBIDDEN);
h6.addVariable("percent", "pv.Percent", IntentHandler.EXPECTATION.FORBIDDEN);
h6.setHandlerFunction(function(variables, location, handler){
    let defaults = {
        toBy: "by",
        percent: "20",
    }
    variables = Object.assign(defaults, variables);
    let parsedVars = parseVariables(variables)
    if(variables.location) {
        location = LocationManager.getInstance().getLocation(variables.location);
    }
    if(variables.setValue === "set"){
        //command was "set" without value given - ask to specify
        return false;
    }
    else return setBrightnessAllGroups(location.lightGroups,parsedVars.percentValue, parsedVars.isRelative);
})
lightBrightnessGroup.push(h6);

const h7 = new IntentHandler();
h7.addVariable("percent", "pv.Percent", IntentHandler.EXPECTATION.REQUIRED);
h7.addVariable("location", "location", IntentHandler.EXPECTATION.OPTIONAL);
h7.addVariable("toBy", "absoluteRelative", IntentHandler.EXPECTATION.OPTIONAL);
h7.addVariable("setValue", "setValue", IntentHandler.EXPECTATION.FORBIDDEN);
h7.setHandlerFunction(function(variables, location, handler){
    let defaults = {
        toBy: "to",
        percent: "20",
    }
    variables = Object.assign(defaults, variables);
    let parsedVars = parseVariables(variables)
    if(variables.location) {
        location = LocationManager.getInstance().getLocation(variables.location);
    }
    return setBrightnessAllGroups(location.lightGroups,parsedVars.percentValue, parsedVars.isRelative);
})
lightBrightnessGroup.push(h7);


const h8 = new IntentHandler();
h8.addVariable("minmax", "minmax", IntentHandler.EXPECTATION.REQUIRED);
h8.addVariable("location", "location", IntentHandler.EXPECTATION.OPTIONAL);
h8.setHandlerFunction(function(variables, location, handler){
    let defaults = {
        toBy: "to",
    }
    variables = Object.assign(defaults, variables);
    let parsedVars = parseVariables(variables)
    if(variables.location) {
        location = LocationManager.getInstance().getLocation(variables.location);
    }
    return setBrightnessAllGroups(location.lightGroups,parsedVars.minmax, parsedVars.isRelative);
})
lightBrightnessGroup.push(h8);

function setBrightnessAllGroups(lightGroupArray, percentValue, isRelative){
    lightGroupArray.forEach(function(lightGroup){
        lightsService.setLightGroupBrightness(lightGroup.id, percentValue, isRelative)
    })
    return true;
}

/**
 *
 * @param variables
 * @returns {{percentValue: number, isRelative: boolean, minmax: number}}
 */
function parseVariables(variables){
    let defaults = {
        toBy: "by",
        percent: "20",
        setValue: "set",
        location: undefined,
        minmax: undefined,
    }
    // if(variables.toBy === undefined || variables.percent === undefined || variables.setValue === undefined) {
    //     console.warn("lightBrightness: Failed to parse input variables. Applying default vars to missing fields...");
    // }
    variables = Object.assign(defaults, variables);
    variables.percent = parseInt(variables.percent);
    let parsedVars = {
        isRelative: true,
        percentValue: variables.percent,
        minmax: undefined,
    }

    switch(variables.toBy) {
        case "by":
            switch(variables.setValue) {
                case "increase":
                case "raise":
                    parsedVars.isRelative = true;
                    break;
                case "decrease":
                case "reduce":
                case "lower":
                    parsedVars.isRelative = true;
                    parsedVars.percentValue = (-1*variables.percent);
                    break;
                default:
                    parsedVars.isRelative = false;
                    break;
            }
            break;
        default:
        case "to":
            parsedVars.isRelative = false;
            break;
    }

    if(variables.minmax){
        switch(variables.minmax) {
            case "max":
            case "maximum":
                parsedVars.minmax = 100;
                parsedVars.isRelative = false;
                break;
            case "min":
            case "minimum":
                parsedVars.minmax = 0;
                parsedVars.isRelative = false;
                break;
        }
    }
    return parsedVars;
}

module.exports = lightBrightnessGroup;

