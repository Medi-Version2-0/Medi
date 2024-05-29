const AbstractModel = require("./abstract_model.js");

class LedgerPartyContact extends AbstractModel {
  constructor() {
    super("ledger_party_contact");
  }
}

module.exports = LedgerPartyContact;
