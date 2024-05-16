const AbstractModel = require('./abstract_model.js');

class Station extends AbstractModel {
    constructor() {
        super('stations');
    }

}

module.exports = Station;