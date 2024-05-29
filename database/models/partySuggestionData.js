const AbstractModel = require('./abstract_model.js');

class PartySuggestions extends AbstractModel {
    constructor() {
        super('party');
    }

}

module.exports = PartySuggestions;