const Location = require("./Location")

class LocationManager {
    constructor(intentManager){
        this.intentManager = intentManager;
        this.locations = [];

        LocationManager.setInstance(this);
    }

    static _instance;

    /**
     * returns the current instance if one exists
     * @returns {LocationManager}
     */
    static getInstance() {
        if (this._instance) {
            return this._instance;
        }
        else {
            console.log("Cannot get instance: Instance does not exists.");
            return undefined;
        }
    }

    /**
     * returns the current instance if one exists, or creates a new instance with the given constructor arguments otherwise
     * @returns {LocationManager}
     */
    static createInstance(intentManager) {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new LocationManager(intentManager);
        return this._instance;
    }

    /**
     * overwrites the instance provided by the class function
     * @returns {LocationManager}
     */
    static setInstance(instance) {
        this._instance = instance;
        return this._instance;
    }

    /**
     * adds a location
     * @param identifier {string}
     * @param recorder {Integer}
     * @returns {Location}
     */
    addLocation(identifier) {
        let location = new Location(identifier);

        this.locations.push(location);
        return location;
    }

    /**
     *
     * @param identifier {string} Location identifier
     * @returns {Location_|undefined}
     */
    getLocation(identifier){
        //try to match identifier
        return this.locations.find(location => location.identifier === identifier);
    }
}

module.exports = LocationManager;