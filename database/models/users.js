const AbstractModel = require("./abstract_model.js");

class Users extends AbstractModel {
  constructor() {
    super("users");
  }
}

module.exports = Users;
