const IntentHandler = require("./intentHandler");
const LightsService = require("../services/LightsService");
const LocationManager = require("../services/LocationManager");

const lightsService = LightsService.getInstance();

var lightBrightnessLight = []

const h1 = new IntentHandler();
h1.addVariable("setValue", "setValue", IntentHandler.EXPECTATION.OPTIONAL);
h1.addVariable("lightSelect", "lightSelect", IntentHandler.EXPECTATION.REQUIRED);
h1.addVariable("toBy", "absoluteRelative", IntentHandler.EXPECTATION.OPTIONAL);
h1.addVariable("percent", "pv.Percent", IntentHandler.EXPECTATION.OPTIONAL);
h1.addVariable("location", "location", IntentHandler.EXPECTATION.OPTIONAL);
h1.addVariable("minmax", "minmax", IntentHandler.EXPECTATION.FORBIDDEN);
h1.setHandlerFunction(function(variables, location, handler){
    //TODO: add light names to locations
    let defaults = {
        setValue: "set",
        toBy: "by",
        percent: "20",
    }
    variables = Object.assign(defaults, variables);
    let parsedVars = parseVariables(variables)
    if(variables.location) {
        location = LocationManager.getInstance().getLocation(variables.location);
    }
    let lights = location.getLightsByAlias(variables.lightSelect)
    lights.forEach(light => {
        lightsService.setLightBrightness(light.id, parsedVars.percentValue, parsedVars.isRelative)
    })
})
lightBrightnessLight.push(h1);

const h2 = new IntentHandler();
h2.addVariable("setValue", "setValue", IntentHandler.EXPECTATION.OPTIONAL);
h2.addVariable("lightSelect", "lightSelect", IntentHandler.EXPECTATION.REQUIRED);
h2.addVariable("toBy", "absoluteRelative", IntentHandler.EXPECTATION.REQUIRED);
h2.addVariable("minmax", "minmax", IntentHandler.EXPECTATION.REQUIRED);
h2.addVariable("location", "location", IntentHandler.EXPECTATION.OPTIONAL);
h2.addVariable("percent", "pv.Percent", IntentHandler.EXPECTATION.FORBIDDEN);
h2.setHandlerFunction(function(variables, location, handler){
    //TODO: add light names to locations
    let defaults = {
        setValue: "set",
        toBy: "to",
    }
    variables = Object.assign(defaults, variables);
    let parsedVars = parseVariables(variables)
    if(variables.location) {
        location = LocationManager.getInstance().getLocation(variables.location);
    }
    let lights = location.getLightsByAlias(variables.lightSelect)
    lights.forEach(light => {
        lightsService.setLightBrightness(light.id, parsedVars.minmax, parsedVars.isRelative)
    })
})
lightBrightnessLight.push(h2);


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
        lightSelect: undefined,
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
    }

    switch(variables.toBy) {
        case "by":
            switch(variables.setValue) {
                case "increase":
                case "raise":
                    parsedVars.isRelative = true;
                    break;
                case "decrease":
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

module.exports = lightBrightnessLight;

