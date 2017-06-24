// import {Factory} from './src/ReduxManager';
const {Factory} = require('./src/ReduxFactory');


const config1 = {
    'label': 'Test 1 container',
    'defaultState': {
        'Hello': 'World'
    },
    'actions': {
        'ACTION1': {
            'actionName': 'Action 1',
            'actionCreator': (para = 'none') => Object.assign({}, {
                'foo': 'bar',
                'para': para
            }),
            'reducerAction': (state, action) => {
                console.log(state);
                state[action.type] = action.payload;
            }
        }
    }
};
const config2 = {
    'label': 'Test 2 container',
    'defaultState': {
        'counter': 0
    },
    'actions': {
        'ACTION2': {
            'actionName': 'Action 2',
            'actionCreator': (inc = 1) => Object.assign({}, {
                'inc': inc
            }),
            'reducerAction': (state, action) => {
                state.counter = action.payload.inc;
            }
        }
    }
};

const c1 = Factory.createContainer('test1', config1);

const c1a1 = c1.actionCreators.action1('123456789');
// console.log('c1a1', JSON.stringify(c1a1, null, 2));
Factory.store.dispatch(c1a1);

// const c1a2 = c1.actionCreators.action1();
// Factory.store.dispatch(c1a2);

// console.log('state', JSON.stringify(Factory.store.getState(), null, 2));
console.log('\n\n########################################\n\n');

/*
const c2 = Factory.createContainer('test2', config2, c1);

console.log('c2a1', JSON.stringify(Factory.store.getState()));
console.log('\n\n########################################\n\n');
Factory.store.dispatch(c2.actionCreators.action2());

console.log('state', JSON.stringify(Factory.store.getState()));
console.log('\n\n########################################\n\n');

Factory.store.dispatch(c2.actionCreators.action2(5));

console.log('state', JSON.stringify(Factory.store.getState()));
*/
