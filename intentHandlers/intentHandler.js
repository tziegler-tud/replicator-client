const EXPECTATION = {
    REQUIRED: 1,
    OPTIONAL: 2,
    FORBIDDEN: 0,
};

class IntentHandler {
    constructor() {
        this.variables = {
            required: {},
            optional: {},
            forbidden: {},
        }
        this.handler = function(){
            console.log("handler function not set.")
        }
    }

    addVariable(identifier, type, expectation) {
        let self = this;
        switch(expectation){
            case EXPECTATION.REQUIRED:
                self.variables.required[identifier] = type;
                break;
            case EXPECTATION.OPTIONAL:
                self.variables.optional[identifier] = type;
                break;
            case EXPECTATION.FORBIDDEN:
                self.variables.forbidden[identifier] = type;
                break;
        }
    }

    checkHandler(variables){
        //we receive the list of variables containend in the voice command. The handler qualifies if both:
        //1) all required are present
        //2) no forbidden are present
        let self = this;
        let match = false;
        let requiredMatch = true;
        let forbiddenMatch = true;
        Object.keys(self.variables.required).forEach(function(variable, index, array){
            //key must be contained in variables
            if(variables[variable] === undefined) {
                //one missing, handler disqualified
                requiredMatch = false;
            }
        })
        Object.keys(self.variables.forbidden).forEach(function(variable, index, array){
            //if a forbidden variable is set, the handler disqualifies
            if(variables[variable] !== undefined ) {
                //it's a match!
                forbiddenMatch = false;
            }
        })
        return (requiredMatch && forbiddenMatch);
    }

    setHandlerFunction(func){
        this.handler = func;
    }

    run(variables, location){
        this.handler(variables, location, this);
    }
}

IntentHandler.EXPECTATION = EXPECTATION;

module.exports = IntentHandler;