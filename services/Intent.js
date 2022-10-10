class Intent {
    constructor(args){
        if(args === undefined) args = {};
        this._title = args.title ? args.title : "";
        this._variables = args.variables? args.variables : {};
        this._lines = [];
        this.handlers = [];
        this._groups = {
            macros: [],
            macrosOptional: [],
            slots: [],
            slotsOptional: [],
        };
    }

    get title(){
        return this._title;
    }

    get variables(){
        return this._variables;

    }

    set title(title){
        this._title = title;
    }

    set variables(variables) {
        this._variables = variables;
    }

    get lines() {
        return this._lines;
    }

    get groups() {
        return this._groups;
    }

    addLine(line){
        this._lines.push(line);
        let self = this;
        //update intent variable groups
        Object.keys(line.groups).forEach(function(key, index, array){
            //check if key is in groups
            if(self._groups[key]!==undefined) {
                //found key, add values if not present
                line.groups[key].forEach(function(token){
                    if(!self._groups[key].includes(token)) self._groups[key].push(token);
                })
            }
        })
        //update variables
        this.updateVariables();
    }

    updateVariables(){
        let self = this;
        //find slots and optional slots in groups
        let slots = this._groups.slots;
        let slotsOptional = this._groups.slotsOptional;
        [slots, slotsOptional].forEach(function(iterator){
            iterator.forEach(function(slot){
                //extract typeIdentifier and variable name
                slot = slot.replace(/\$/, "");
                let tokens = slot.split(":");
                let type = tokens[0];
                let name = tokens[1];
                if(self._variables[name] === undefined) {
                    self._variables[name] = type;
                }
            })
        })
    }

    addHandler(handler){
        this.handlers.push(handler);
    }

    addHandlerArray(handlerArray){
        handlerArray.forEach(handler =>{
            this.handlers.push(handler)
        });
    }

    checkHandlers(variables) {
        let qualified = [];
        this.handlers.forEach(function(handler){
            if (handler.checkHandler(variables)) qualified.push(handler);
        })
        return qualified;
    }

}

module.exports = Intent;