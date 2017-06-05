import * as Redux from 'redux';

/**
 * 
 * 
 * @class ReduxStructureContainer
 */
class ReduxStructureContainer {


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
     * 
     * 
     * @readonly
     * 
     * @memberof ReduxStructureContainer
     */
    get state(){
        if(!this.parent){
            return {};
        }

        return (this.parent.slices[this.name] || {})._self || {};
    }

    get _slices(){
        if(!this.parent){
            return {};
        }

        return (this.parent._slices[this.name] || {})._slices || {};
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

        this.actions = {};
        this.actionCreators = {};
        this.reducerActions = {};
        this.mapping = {};

        for(const actionKey of config.actions){
            const fktName = actionKey
                .replace(/[\W_]+/g, ' ')
                .replace(
                    /(\w)(\w*)( ?)/g,
                    (match, p1, p2, p3, offset) => (offset === 0 ? p1.toLowerCase() : p1) + p2.toLowerCase()
                )
            ;

            const actionName = config.actions[actionKey].actionName;
            const actionCreator = config.actions[actionKey].actionCreator.bind(null);
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
                this.filter[filterKey] = config.filter[filterKey].bind(null);
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
        return this.mapping[action.type].reducerAction(state, action) || state;
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
    reducer(state = this.defaultState, action){
        if(!action || !this.mapping[action.type] || typeof this.mapping[action.type].reducerAction !== 'function'){
            return state;
        }
        
        const slicesReducer = {};
        Object.keys(this.slices).forEach(childName => {
            slicesReducer[childName] = this.slices[childName].reducer;
        });

        const reducer = Redux.combineReducers({
            '_self': this.reducerHandler,
            '_slices': Redux.combineReducers(slicesReducer)
        });

        return reducer;
    }
}

const Container = ReduxStructureContainer;
export default Container;
