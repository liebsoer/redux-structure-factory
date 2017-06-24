// import * as Redux from 'redux';
const Redux = require('redux');

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

        prefix += this.name + ' # ';
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

        this.defaultState = {};
        this.defaultState._self = (config.defaultState && config.defaultState.constructor === Object) ? Object.assign({}, config.defaultState) : {};

        this.stateHandler = () => {
            if(!this.parent){
                return {};
            }

            return (this.parent.slices[this.name] || {})._self || {};
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

            const actionName = this.prefix + config.actions[actionKey].actionName;
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
                console.log(this.name, `No action "${action.type}" found. Returning`, JSON.stringify(this.defaultState));
            }
            return this.defaultState;
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
        // TODO: Reducer not calculated correctly

        const slicesReducer = {};
        Object.keys(this.slices).forEach(childName => {
            slicesReducer[childName] = this.slices[childName].reducer.bind(this);
        }, this);

        // console.log(this.name, new Date().getTime(), action.type, 'sliceReducer', JSON.stringify(slicesReducer), new Error().stack);

        const slicesKeys = Object.keys(slicesReducer);
        const slicesLength = slicesKeys.length;
        let reducer;

        if(slicesLength === 1){
            const slice = this.slices[slicesKeys[0]];
            const sliceAction = (state, action) => {
                if(action.type !== slice.actions[slicesKeys[0]]){
                    return {
                        [slicesKeys[0]]: slice.defaultState
                    };
                }

                return {
                    [slicesKeys[0]]: slicesReducer[slicesKeys[0]](state, action).bind(this)
                };
            };


            reducer = Redux.combineReducers({
                '_self': this.reducerHandler.bind(this),
                '_slices': sliceAction
            });
        } else if (slicesLength > 1) {
            reducer = Redux.combineReducers({
                '_self': this.reducerHandler.bind(this),
                '_slices': Redux.combineReducers(slicesReducer)
            });
        } else {
            // console.log('No slices');
            // reducer = Redux.combineReducers({
            //     '_self': this.reducerHandler.bind(this)
            // });

            reducer = (state, action) => {
                return {
                    '_self': this.reducerHandler.call(this, state, action)
                };
            };
        }

        return reducer(state || this.defaultState, action);
    }
}

exports.Container = ReduxStructureContainer;

// const Container = ReduxStructureContainer;
// export default Container;
