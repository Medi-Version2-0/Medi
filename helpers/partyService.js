const LedgerParty = require("./../database/models/ledger_party");

const ledgerParty = new LedgerParty();

module.exports.addParty = (partyData) => {
  ledgerParty.insert(partyData);
};
