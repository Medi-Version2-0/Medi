const AbstractModel = require('./abstract_model.js');

class Store extends AbstractModel {
    constructor() {
        super('store');
    }

}

module.exports = Store;