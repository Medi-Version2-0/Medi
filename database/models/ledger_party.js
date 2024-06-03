const AbstractModel = require("./abstract_model.js");

class LedgerParty extends AbstractModel {
  constructor() {
    super("party_table");
  }
}

module.exports = LedgerParty;
