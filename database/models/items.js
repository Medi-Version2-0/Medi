const AbstractModel = require("./abstract_model.js");

class Items extends AbstractModel {
  constructor() {
    super("items");
  }
}

module.exports = Items;
