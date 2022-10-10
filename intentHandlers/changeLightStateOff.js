const IntentHandler = require("./intentHandler");
const LightsService = require("../services/LightsService");
const LocationManager = require("../services/LocationManager");

const lightsService = LightsService.getInstance();

var changeLightStateOff = []


const location = new IntentHandler();
location.addVariable("location", "location", IntentHandler.EXPECTATION.OPTIONAL);
location.setHandlerFunction(function(variables, location, handler){
    let variableLocation;
    if(variables.location) {
         variableLocation =  LocationManager.getInstance().getLocation(variables.location);
    }
    else {
        variableLocation = location;
    }
    variableLocation.lightGroups.forEach(function(lightGroup){
        lightsService.setLightGroupStateByName(lightGroup.name, LightsService.STATES.OFF)
    })
})
changeLightStateOff.push(location)


module.exports = changeLightStateOff;

