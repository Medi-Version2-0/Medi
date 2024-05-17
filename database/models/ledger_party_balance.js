const AbstractModel = require("./abstract_model.js");

class LedgerPartyBalance extends AbstractModel {
  constructor() {
    super("ledger_party_balance");
  }
}

module.exports = LedgerPartyBalance;
