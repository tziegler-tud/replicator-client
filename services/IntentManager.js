const yaml = require('js-yaml');
const fs   = require('fs');

const Intent = require("./Intent");

class IntentManager {
    constructor(){
        this.intents = [];
    }

    loadConfig(path){
        console.log("Intent manager is loading config file...");
        //read yaml file
        try {
            const doc = yaml.load(fs.readFileSync(appRoot + path, 'utf8'));
            this.parseDoc(doc)
                .then(function(result){
                    console.log("Intent Manager config loaded successfully.")
                })
                .catch(function(error){
                    console.error("Intent Manager: Failed to load config: " + error);
                })
        } catch (e) {
            console.log(e);
        }

    }

    async parseDoc(doc){
        //parse the json-style yaml config file to find all intents and variables
        let expressions = doc.context.expressions;
        let self = this;

        Object.keys(expressions).forEach(function(key,index) {
            // key: the name of the object key
            // index: the ordinal position of the key within the object
            let title = key;
            let lines = expressions[key];

            let intent = new Intent();
            intent.title = title;



            var intentGroups = {
                macros: [],
                macrosOptional: [],
                slots: [],
                slotsOptional: [],
            }

            lines.forEach(function(line, index){
                //lines contain 3 types of tokens, seperated by white-spaces, $ or @: words (no prefix), variables($-prefixed), aliases(@-prefixed)
                //we are only interested in @-prefixed tokens
                //remove ()
                // line = line.replace(/[\(\)]/g, "");
                // let tokens = line.split(/ |\w\$|\w@|\(\$|\(@/);
                let raw = line.slice();
                let tokens = line.matchAll(/(?<macros>(?<!\()@\w+)|(?<macrosOptional>(?<=\()@\w+)|(?<slots>(?<!\()\$\w+:\w+)|(?<slotsOptional>(?<=\()\$\w+:\w+)/g)
                var groups = {
                    macros: [],
                    macrosOptional: [],
                    slots: [],
                    slotsOptional: [],
                }
                for (const match of tokens){
                    Object.keys(match.groups).forEach(function(key){
                        let currentGroup = match.groups[key];
                        if(currentGroup !== undefined) {
                            groups[key].push(currentGroup);
                        }
                    })
                }
                let intentLine = {
                    index: index,
                    raw: raw,
                    groups: groups,
                }
                intent.addLine(intentLine)
            })

            self.addIntent(intent)
        })
        return true;
    }

    addIntent(intent){
        this.intents.push(intent)
    }

    getIntent(intentTitle) {
        let match = this.intents.find(intent => {
            return intent.title === intentTitle;
        })
        return match;
    }
}

var line = function(index, raw, groups){
    this.index = index;
    this.raw = raw;
    this.groups = groups;
    return this;
}

module.exports = IntentManager;