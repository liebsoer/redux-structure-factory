export default class ReduxStructureContainer {
    constructor(name, config, parent){
        this.name = name;
        this.parent = parent || null;
    }
}
