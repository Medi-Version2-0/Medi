const AbstractModel = require('./abstract_model.js');

class PartySuggestions extends AbstractModel {
    constructor() {
        super('ledger_party');
    }

}

module.exports = PartySuggestions;