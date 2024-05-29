const AbstractModel = require("./abstract_model.js");

class LedgerPartyAccountDetails extends AbstractModel {
  constructor() {
    super("ledger_account_details");
  }
}

module.exports = LedgerPartyAccountDetails;
