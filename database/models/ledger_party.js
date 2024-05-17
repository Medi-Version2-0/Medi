const AbstractModel = require("./abstract_model.js");

class LedgerParty extends AbstractModel {
  constructor() {
    super("ledger_party");
  }
}

module.exports = LedgerParty;
