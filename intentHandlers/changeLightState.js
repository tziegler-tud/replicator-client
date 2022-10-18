const IntentHandler = require("./intentHandler");
const LightsService = require("../services/LightsService");
const LocationManager = require("../services/LocationManager");

const lightsService = LightsService.getInstance();

var changeLightState = []

const stateAll = new IntentHandler();
stateAll.addVariable("state", "state", IntentHandler.EXPECTATION.REQUIRED);
stateAll.addVariable("location", "location", IntentHandler.EXPECTATION.OPTIONAL);
stateAll.addVariable("lightSelect", "lightSelect", IntentHandler.EXPECTATION.FORBIDDEN);
stateAll.setHandlerFunction(
    /**
     *
     * @param variables {Object}
     * @param location {Location_}
     * @param handler {IntentHandler}
     */
    function(variables, location, handler){
        let newState = variables.state;
        //change state of lights in current location
        if(variables.location){
            location = LocationManager.getInstance().getLocation(variables.location);
            if(!location) {
                console.warn("Location " + variables.location + " not found. Aborting command.")
                return false;
            }
        }
        location.lightGroups.forEach(function(lightGroup){
            lightsService.setLightGroupStateByName(lightGroup.name, variables.state)
        })
    }
)
changeLightState.push(stateAll);

const location = new IntentHandler();
location.addVariable("state", "state", IntentHandler.EXPECTATION.FORBIDDEN);
location.addVariable("location", "location", IntentHandler.EXPECTATION.OPTIONAL);
location.addVariable("lightSelect", "lightSelect", IntentHandler.EXPECTATION.FORBIDDEN);
location.setHandlerFunction(function(variables, location, handler){
    //toggle state of lights in the given location
    if(variables.location){
        //get the location
        location = LocationManager.getInstance().getLocation(variables.location);
    }
    location.lightGroups.forEach(function(lightGroup){
        lightsService.toggleLightGroupByName(lightGroup.name);
    })
})
changeLightState.push(location)


const h1 = new IntentHandler();
h1.addVariable("lightSelect", "lightSelect", IntentHandler.EXPECTATION.REQUIRED);
h1.addVariable("state", "state", IntentHandler.EXPECTATION.OPTIONAL);
h1.addVariable("location", "location", IntentHandler.EXPECTATION.OPTIONAL);
h1.setHandlerFunction(function(variables, location, handler){
    //TODO: add light names to locations
    let defaults = {

    }
    if(variables.location) {
        location = LocationManager.getInstance().getLocation(variables.location);
    }
    let lights = location.getLightsByAlias(variables.lightSelect)
    if(variables.state) {
        lights.forEach(light=>{
            lightsService.setLightState(light.id, variables.state)
        });
    }
    else
        lights.forEach(light=>{
            lightsService.toggleLightState(light.id);
        });

})
changeLightState.push(h1);


module.exports = changeLightState;

