// import {Manager} from './src/ReduxManager';
const {Manager} = require('./src/ReduxManager');


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
                state[action.type] = action.payload;
            }
        }
    }
};

const c1 = Manager.createContainer('test1', config1);

console.log('c1', JSON.stringify(c1.state));
console.log('state', JSON.stringify(Manager.store.getState()));
console.log('\n\n########################################\n\n');

Manager.store.dispatch(c1.actionCreators.action1('123456789'));

console.log('c1', JSON.stringify(c1.state));
console.log('state', JSON.stringify(Manager.store.getState()));
console.log('\n\n########################################\n\n');

Manager.store.dispatch(c1.actionCreators.action1());

console.log('c1', JSON.stringify(c1.state));
console.log('state', JSON.stringify(Manager.store.getState()));
console.log('\n\n########################################\n\n');
