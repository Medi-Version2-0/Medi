const AbstractModel = require("./abstract_model.js");

class Company extends AbstractModel {
  constructor() {
    super("company");
  }
}

module.exports = Company;
