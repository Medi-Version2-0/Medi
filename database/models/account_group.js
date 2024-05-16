const AbstractModel = require('./abstract_model');

class Groups extends AbstractModel {
  constructor() {
    super("account_group");
  }

}

module.exports = Groups;
