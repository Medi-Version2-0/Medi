const AbstractModel = require("./abstract_model.js");

class ItemBatch extends AbstractModel {
  constructor() {
    super("item_batch");
  }
}

module.exports = ItemBatch;
