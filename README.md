# Status
<img src="https://cdn.travis-ci.com/images/logos/TravisCI-Full-Color-45e242791b7752b745a7ae53f265acd4.png" height="20"> [![Build Status](https://travis-ci.org/liebsoer/redux-structure-factory.svg?branch=master)](https://travis-ci.org/liebsoer/redux-structure-factory)

# redux-structure-factory
Factory module to create a redux structure


# Installation

TBD

# Usage

## Container configuration
**Configuration object**
```javascript
{
  'label': 'Some Name',
  'defaultState': {},
  'actions': {
    'ACTION_KEY': {
      'actionName': 'An action',
      'actionCreator': function(...payload){ ... },
      'reducerAction': function(state, action) { ... }
    }
  },
  'filter': {
    'filterName': function(...filterArgs){ ... }
  }
}
```

**Description**

| Field Name | Type | Description |
| - | - | - |
| label | string | <p>Redux container label. If not existing, registered name will be used.</p><p>_Mandatory_: false</p>|
| defaultState | object | <p>Default state. If no default state is defined an empty object will be used.</p><p>_Mandatory_: false</p>|
| actions | object | <p>Holds all actions with it's respective action creator function and reducer function</p><p>*Mandatory*: true</p> |
| ACTION_KEY | object | <p>Name of the action. It will be automatically converted to `camelCase` and used as the function name.<br>Must be `UPPER_CASE [A_Z_]`. Otherwise it will be ignored!</p><p>_Mandatory_: true</p> |
| actionName | string | <p>Descriptive text of the action.</p><p>_Mandatory_: true |
| actionCreator | function | <p>Creates a valid action for processing the calculation of the new state. Only pure JSON (see also http://json.org/) values are allowed. Other value types will be stringified with _`JSON.stringify()`_ and if that returns _`undefined`_ the function _`toString()`_ is tried to be called. If this also returns _`undefined`_ the payload parameter will be ignored. Also parameter with value _`undefined`_ are ignored.<br>If the field is missing an simple object with just the _`type`_ and an empty _`payload`_ object will be created.</p><p>_Mandatory_: false</p><p>`@param` _**...payload**_ _(optional)_ One ore more arguments to store inside the payload for calculating the new state.<br>`@return` Object with fields _`type`_ which is the same as _`ACTION_NAME`_ and _`payload`_ where the calculated payload is stored into.</p>|
| reducerAction | function | <p>Calculates the new partial state the container is responsible for. If no return value is present for the reducer, the factory takes care of returning the original state. </p><p>_Mandatory_: true</p><p>`@param` _**state**_ A copy of the old state. The factory takes care of passing a copy of the old state. So the second Redux principle isn't violated. The state can safely be altered. <br>`@param` _**action**_ Object with fields _`type`_ which is the same as _`ACTION_NAME`_ and _`payload`_ where the payload is stored into.<br>`@return` The new state</p> |
| filter | object | <p>Contains functions to filter the state.</p><p>_Mandatory_: false</p>|
| filterName | function | <p>Filters the state and returns only the information wanted.</p><p>_Mandatory_: false</p><p>`@param` _**...filterArgs**_ (optional) One or more arguments to narrow the filter result<br>`@return` Filtered value or null if no matching value can be found</p> |

# API

TBD

# License
This module is licensed under the <a href="http://www.gnu.org/licenses/gpl-3.0.en.html" target=_blank>GNU GENERAL PUBLIC LICENSE Version 3</a>. For more details have a look inside the [LICENSE](LICENSE) file or visit the <a href="http://www.gnu.org/licenses/gpl-3.0.en.html" target=_blank>official page</a>.
