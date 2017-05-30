import ReduxStructureContainer from './ReduxStructureContainer';

export default class ReduxStructureFactory {
    static createContainer(name, config, parent){
        if(!ReduxStructureFactory.testConfig(name, config)){
            return;
        }

        const instance = new ReduxStructureContainer(name, config, parent);

        return instance;
    }

    static testConfig(name, config){
        if(typeof name !== 'string'){
            console.error('No name given to register the container for!');
            return false;
        }
        
        if(!config){
            console.error(name, ':', 'Config object is missing!');
            return false;
        }

        let isValid = true;
        if(!config.actions){
            console.error(name, ':', 'Mandatory filed actions is missing!');
            isValid = false;
        }

        if(config.actions && !(config.actions.constructor === Object)){
            console.error(name, ':', 'Field \"actions\" is no object!');
            isValid = false;
        }

        for(const actionKey of Object.keys(config.actions)){
            const actionName = config.actions[actionKey].actionName;
            const creator = config.actions[actionKey].actionCreator;
            const reducer = config.actions[actionKey].reducer;

            if(!/^[A-Z_]+$/.test(actionKey)){
                console.error(name, ':', '\"ACTION_KEY\" must match \"^[A-Z_]+$\" but was \"' + actionKey + '\"');
                isValid = false;
            }

            if(!actionName){
                console.error(name, ':', 'Mandatory actions field \"actionName\" is missing!');
                isValid = false;
            }

            if(actionName && typeof actionName !== 'string'){
                console.error(name, ':', 'Value of \"actionName\" is not of required type \"string\" for \"actions\" field \"' + actionKey + '\"!');
                isValid = false;
            }

            if(creator && typeof creator !== 'function'){
                console.error(name, ':', 'Value of \"actionCreator\" is not of required type \"function\" for \"actions\" field \"' + actionKey + '\"!');
                isValid = false;
            }

            if(!reducer){
                console.error(name, ':', 'Required field \"reducer\" is missing for \"actions\" field \"' + actionKey + '\"');
                isValid = false;
            }
            
            if(reducer && typeof reducer !== 'function'){
                console.error(name, ':', 'Value of \"reducer\" is not of required type \"function\" for \"actions\" field \"' + actionKey + '\"!');
                isValid = false;
            }
        }

        for(const filterKey of Object.keys(config.filter)){
            const filter = config.filter[filterKey];

            if(!/[a-zA-Z$_][a-zA-Z0-9$_]*/g.test(filterKey)){
                console.error(name, ':', 'Filter key name must start with a character, $ or _ and can be optionally followed by alphanumeric characters, $ and _ but was \"' + filterKey + '\"');
                isValid = false;
            }

            if(typeof filter !== 'function'){
                console.error(name, ':', 'Value for filter key \"' + filterKey + '\" is not a function!');
                isValid = false;
            }
        }

        return isValid;
    }

}
