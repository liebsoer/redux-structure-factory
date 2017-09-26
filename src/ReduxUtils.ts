import { Action } from 'redux';
import { cloneDeep } from 'lodash';

class ReduxUtils {

    static combineStructureReducers(prefix: string, selfReducer: Function, slicesReducer: any){
        const fallbackState = {
            '_self': {},
            '_slices': {}
        };
        return (state = fallbackState, action: Action) => {
            const newState: any = cloneDeep(state);

            if(!action || !action.type){
                return newState;
            }

            if(action.type === '@@redux/INIT'){
                const initState: any = {};
                initState._self = selfReducer(newState._self, action);
                initState._slices = {};

                Object.keys(slicesReducer).forEach(sliceKey => {
                    initState._slices[sliceKey] = slicesReducer[sliceKey]((newState._slices || {})[sliceKey], action);
                });

                return initState;
            }
            
            const type = action.type;
            const actionPrefix = type.substr(0, type.indexOf(' # '));
            const prefixParts = prefix.substr(0, type.indexOf(' # ')).split(' -> ');
            const actionPrefixParts = actionPrefix.substr(0, type.indexOf(' # ')).split(' -> ');
            
            if(prefix === actionPrefix){
                newState._self = selfReducer(newState._self, action);
            } else {
                for(let i = 0; i < prefixParts.length; i++){
                    if(prefixParts[i] !== actionPrefixParts[i]){
                        break;
                    } else if (i === prefixParts.length - 1){
                        const sliceKey = actionPrefixParts[i + 1];
                        if(sliceKey && newState._slices[sliceKey] && slicesReducer[sliceKey]){
                            newState._slices[sliceKey] = slicesReducer[sliceKey](newState._slices[sliceKey], action);
                        }
                        break;
                    }
                }
            }

            return newState;
        };
    }
}

export default ReduxUtils;
