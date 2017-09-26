import ReduxUtils from './ReduxUtils';
// const Redux = require('redux');
// const {Utils} = require('./ReduxUtils');

/**
 * 
 * 
 * @class ReduxStructureContainer
 */
export class ReduxStructureContainer {

    actions: any = {};
    actionCreators: any = {};
    reducerActions: any = {};
    mapping: any = {};
    filter: any;
    label: string;
    name: string;
    parent: ReduxStructureContainer;
    slices: any;
    defaultState: any;

    stateHandler: Function;
    _slicesHandler: Function;

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
    constructor(name: string, config: any, parent?: ReduxStructureContainer){

        this.name = name;
        this.label = config.label || this.name;

        if(parent){
            this.parent = parent;
        }

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

        for(const actionKey of Object.keys(config.actions)){
            const fktName = actionKey
                .replace(/[\W_]+/g, ' ')
                .replace(
                    /(\w)(\w*)( ?)/g,
                    (_match, p1, p2, _p3, offset) => (offset === 0 ? p1.toLowerCase() : p1) + p2.toLowerCase()
                )
            ;

            const actionName = this.prefix + ' # ' + config.actions[actionKey].actionName;
            const actionCreator = (...args: any[]) => Object.assign({}, {
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
                this.filter[filterKey] = (...args: any[]) => config.filter[filterKey].apply(null, this.state, args);
            }
        }
    }

    /**
     * 
     * 
     * @param {ReduxStructureContainer} container 
     * @returns 
     * 
     * @memberof ReduxStructureContainer
     */
    addSubContainer(container: ReduxStructureContainer){
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
    reducerHandler(state = this.defaultState, action: any){
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
    reducer(state: any, action: any){

        const slicesReducer: any = {};
        Object.keys(this.slices).forEach(childName => {
            slicesReducer[childName] = this.slices[childName].reducer.bind(this.slices[childName]);
        }, this);

        const reducer = ReduxUtils.combineStructureReducers(
            this.prefix,
            this.reducerHandler.bind(this),
            slicesReducer
        );

        return reducer(state || this.defaultState, action);
    }
}

export default ReduxStructureContainer;
