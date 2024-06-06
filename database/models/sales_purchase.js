const AbstractModel = require('./abstract_model.js');

class SalesPurchase extends AbstractModel {
    constructor() {
        super('sales_purchase');
    }

}

module.exports = SalesPurchase;