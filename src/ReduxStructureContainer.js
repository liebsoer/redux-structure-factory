// import * as Redux from 'redux';
// const Redux = require('redux');
const {Utils} = require('./ReduxUtils');

/**
 * 
 * 
 * @class ReduxStructureContainer
 */
class ReduxStructureContainer {

    get state() {
        return this.stateHandler();
    }

    get _slices() {
        return this._slicesHandler();
    }

    /**
     * 
     * 
     * @readonly
     * 
     * @memberof ReduxStructureContainer
     */
    get prefix(){
        let prefix = '';
        if(this.parent){
            let p = this.parent;
            while(p){
                prefix = p.name + ' -> ' + prefix;
                p = p.parent;
            }
        }

        prefix += this.name;
        return prefix;
    }

    /**
     * Creates an instance of ReduxStructureContainer.
     * @param {any} name 
     * @param {any} config 
     * @param {any} parent 
     * 
     * @memberof ReduxStructureContainer
     */
    constructor(name, config, parent){

        this.name = name;
        this.label = config.label || this.name;

        this.parent = parent || null;

        this.slices = {};

        this.filter = {};

        this.defaultState = (config.defaultState && config.defaultState.constructor === Object) ? Object.assign({}, config.defaultState) : {};

        this.stateHandler = () => {
            if(!this.parent){
                return {};
            }

            return (this.parent._slices[this.name] || {})._self || {};
        };

        this._slicesHandler = () => {
            if(!this.parent){
                return {};
            }

            return (this.parent._slices[this.name] || {})._slices || {};
        };

        this.actions = {};
        this.actionCreators = {};
        this.reducerActions = {};
        this.mapping = {};

        for(const actionKey of Object.keys(config.actions)){
            const fktName = actionKey
                .replace(/[\W_]+/g, ' ')
                .replace(
                    /(\w)(\w*)( ?)/g,
                    (match, p1, p2, p3, offset) => (offset === 0 ? p1.toLowerCase() : p1) + p2.toLowerCase()
                )
            ;

            const actionName = this.prefix + ' # ' + config.actions[actionKey].actionName;
            const actionCreator = (...args) => Object.assign({}, {
                'type': actionName,
                'payload': config.actions[actionKey].actionCreator.apply(null, args)
            });
            const reducerAction = config.actions[actionKey].reducerAction.bind(null);

            this.actions[actionKey] = actionName;
            this.actionCreators[fktName] = actionCreator;
            this.reducerActions[fktName] = reducerAction;

            this.mapping[actionName] = {
                'actionCreator': actionCreator,
                'reducerAction': reducerAction
            };
        }

        if(config.filter){
            for(const filterKey of Object.keys(config.filter)) {
                this.filter[filterKey] = (...args) => config.filter[filterKey].apply(null, this.state, args);
            }
        }
    }

    /**
     * 
     * 
     * @param {any} container 
     * @returns 
     * 
     * @memberof ReduxStructureContainer
     */
    addSubContainer(container){
        if(!container || container.constructor !== this.constructor){
            console.error('Only valid instances are allowed!', container);
            return;
        }

        this.slices[container.name] = container;
    }

    /**
     * 
     * 
     * @param {any} [state=this.defaultState] 
     * @param {any} action 
     * @returns 
     * 
     * @memberof ReduxStructureContainer
     */
    reducerHandler(state = this.defaultState, action){
        if(!action || !this.mapping[action.type] || typeof this.mapping[action.type].reducerAction !== 'function'){ 
            if(!/^@@redux/.test(action.type)){
                console.debug(this.name, `No action "${action.type}" found. Returning`, JSON.stringify(state));
            }
            return state;
        }

        return ((this.mapping[action.type] || {}).reducerAction || (() => {}))(state, action) || state;
    }

    /**
     * 
     * 
     * @param {any} [stat] 
     * @param {any} action 
     * @returns 
     * 
     * @memberof ReduxStructureContainer
     */
    reducer(state, action){

        const slicesReducer = {};
        Object.keys(this.slices).forEach(childName => {
            slicesReducer[childName] = this.slices[childName].reducer.bind(this.slices[childName]);
        }, this);

        const reducer = Utils.combineStructureReducers(
            this.prefix,
            this.reducerHandler.bind(this),
            slicesReducer
        );

        return reducer(state || this.defaultState, action);
    }
}

exports.Container = ReduxStructureContainer;

// const Container = ReduxStructureContainer;
// export default Container;
