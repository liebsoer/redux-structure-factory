/*
import * as _ from 'lodash';
import * as Redux from 'redux';
import ReduxStructureContainer from './ReduxStructureContainer';
*/

const _ = require('lodash');
const Redux = require('redux');
const ReduxStructureContainer = require('./ReduxStructureContainer').Container;

/**
 * Manager for creating and managing a redux store.
 * 
 * @class ReduxFactory
 */
class ReduxFactory {

    /**
     * Creates an instance of ReduxFactory.
     * 
     * @memberof ReduxFactory
     */
    constructor() {
        let enhancer = null;
        if(typeof window !== 'undefined'){
            // Enables redux dev tools. See https://github.com/zalmoxisus/redux-devtools-extension
            enhancer = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
        }

        this.store = Redux.createStore((state => state), enhancer);
    }

    /**
     * Creates a new redux manager
     * 
     * @param {string} name 
     * @param {object} config 
     * @param {ReduxStructureContainer|boolean} parent Parent to add created container to or boolean to replace top reducer
     * @param {boolean} override (optional) If true child container will be replaced if existing. Children of the child container will be removed!
     * @returns Created instance
     * 
     * @memberof ReduxFactory
     */
    createContainer(name, config, parent, override) {
        if (!this.testConfig(name, config, parent, override)) {
            return;
        }

        if (this.topContainer instanceof ReduxStructureContainer &&
            (!parent || !(parent instanceof ReduxStructureContainer || parent !== true))) {
            console.error('You must either say to which parent container is added to or explicitly trigger overriding top reducer!');
            return;
        }

        const newContainer = new ReduxStructureContainer(name, config, parent);

        if(!parent || (parent && override)){
            newContainer.stateHandler = () => _.cloneDeep(this.store.getState()._self || {});
            newContainer._slicesHandler = () => _.cloneDeep(this.store.getState()._slices || {});
            this.topContainer = newContainer;
        } else {
            parent.addSubContainer(newContainer);
        }

        this.updateStore();
        return newContainer;
    }


    /**
     * Checks if given configuration is valid
     * 
     * @param {string} name Unique name of 
     * @param {any} config 
     * @param {ReduxStructureContainer|boolean} parent
     * @returns 
     * 
     * @memberof ReduxFactory
     */
    testConfig(name, config, parent, override) {
        if (typeof name !== 'string') {
            console.error('No name given to register the container for!');
            return false;
        }

        if (!config) {
            console.error(name, ':', 'Config object is missing!');
            return false;
        }

        if (!override && parent && parent.children && parent.children[name]) {
            console.error('Child container already exists and is not allowed to be overridden!');
            return;
        }

        let isValid = true;
        if (!config.actions) {
            console.error(name, ':', 'Mandatory filed actions is missing!');
            isValid = false;
        }

        if (config.actions && !(config.actions.constructor === Object)) {
            console.error(name, ':', 'Field \"actions\" is no object!');
            isValid = false;
        }

        for (const actionKey of Object.keys(config.actions)) {
            const actionName = config.actions[actionKey].actionName;
            const creator = config.actions[actionKey].actionCreator;
            const reducer = config.actions[actionKey].reducerAction;

            if (!/^[A-Z_][A-Z0-9_]*$/.test(actionKey)) {
                console.error(name, ':', '\"ACTION_KEY\" must match \"^[A-Z_][A-Z0-9_]*$\" but was \"' + actionKey + '\"');
                isValid = false;
            }

            if (!actionName) {
                console.error(name, ':', 'Mandatory actions field \"actionName\" is missing!');
                isValid = false;
            }

            if (actionName && typeof actionName !== 'string') {
                console.error(name, ':', 'Value of \"actionName\" is not of required type \"string\" for \"actions\" field \"' + actionKey + '\"!');
                isValid = false;
            }

            if (creator && typeof creator !== 'function') {
                console.error(name, ':', 'Value of \"actionCreator\" is not of required type \"function\" for \"actions\" field \"' + actionKey + '\"!');
                isValid = false;
            }

            if (!reducer) {
                console.error(name, ':', 'Required field \"reducer\" is missing for \"actions\" field \"' + actionKey + '\"');
                isValid = false;
            }

            if (reducer && typeof reducer !== 'function') {
                console.error(name, ':', 'Value of \"reducer\" is not of required type \"function\" for \"actions\" field \"' + actionKey + '\"!');
                isValid = false;
            }
        }

        if(config.filter){
            for (const filterKey of Object.keys(config.filter)) {
                const filter = config.filter[filterKey];

                if (!/[a-zA-Z$_][a-zA-Z0-9$_]*/g.test(filterKey)) {
                    console.error(name, ':', 'Filter key name must start with a character, $ or _ and can be optionally followed by alphanumeric characters, $ and _ but was \"' + filterKey + '\"');
                    isValid = false;
                }

                if (typeof filter !== 'function') {
                    console.error(name, ':', 'Value for filter key \"' + filterKey + '\" is not a function!');
                    isValid = false;
                }
            }
        }

        return isValid;
    }


    /**
     * Updated the store with the latest reducer.<br>
     * Attention: Replaces the current store reducer!
     * 
     * 
     * @memberof ReduxFactory
     */
    updateStore() {
        this.store.replaceReducer(this.topContainer.reducer.bind(this.topContainer));
    }

}

exports.Factory = new ReduxFactory();

// const Factory = new ReduxFactory();
// export default Factory;
