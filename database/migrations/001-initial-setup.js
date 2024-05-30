const { statesList } = require("../models/states");
const { groups } = require("../models/groups");
const { PartyList } = require("../models/party");

const insertStatements = (statesList.sort((a, b) => a.state_code - b.state_code)).map((state) => {
  const { state_code, state_name, union_territory } = state;
  const unionTerritoryValue = union_territory ? 1 : 0;
  return `(${state_code}, '${state_name}', ${unionTerritoryValue})`;
});

const insertGroups = groups.map((group) => {
  const { group_code, group_name, parent_code, type, isPredefinedGroup } =
    group;
  const isPredefinedGroupValue = isPredefinedGroup ? 1 : 0;
  return `(${group_code}, '${group_name}', ${parent_code}, '${type}', ${isPredefinedGroupValue})`;
});

const insertPartyAccountGroup = PartyList.map((party) => {
  let { party_name, account_group, isPredefinedParty, account_code } = party;
  groups.map((group) => {
    const {group_code, group_name} = group;
    if(account_group === group_name){
      account_code = group_code;
    }
  })
  const isPredefinedPartyValue = isPredefinedParty ? 1 : 0;
  return `('${party_name}', ${account_code},${isPredefinedPartyValue} )`;
});

module.exports = {
  up: [
      `CREATE TABLE IF NOT EXISTS states (
        state_code INTEGER PRIMARY KEY,
        state_name TEXT NOT NULL,
        union_territory boolean            
      )`,
      `CREATE TABLE IF NOT EXISTS stations (
        station_id INTEGER PRIMARY KEY,
        station_name TEXT NOT NULL,
        cst_sale BOOLEAN DEFAULT FALSE,
        state_code INTEGER NOT NULL,
        station_pinCode INTEGER,
        station_headQuarter TEXT NOT NULL,
        FOREIGN KEY (state_code) REFERENCES states(state_code)
    )`,
    `CREATE TABLE IF NOT EXISTS groups (
            group_code INTEGER PRIMARY KEY,
            group_name TEXT NOT NULL,
            type TEXT CHECK (type IN ('P&L', 'Balance Sheet')) NOT NULL,
            parent_code INTEGER,
            isPredefinedGroup BOOLEAN NOT NULL,
            FOREIGN KEY (parent_code) REFERENCES groups(group_code)
        )`,
    `CREATE TABLE IF NOT EXISTS account_group (
            head_code INTEGER PRIMARY KEY,
            head_name TEXT NOT NULL,
            parent_code INTEGER,
            FOREIGN KEY (parent_code) REFERENCES groups(group_code)
        )`,

    `CREATE TABLE IF NOT EXISTS ledger_party (
            party_id INTEGER PRIMARY KEY,
            partyName TEXT NOT NULL,
            account_code INTEGER NOT NULL,
            isPredefinedParty BOOLEAN NOT NULL,
            station_id INTEGER,
            mailTo TEXT,
            address TEXT,
            country TEXT,
            state TEXT,
            city TEXT,
            pinCode INTEGER,
            parentLedger Text,
            fixedAssets Text,
            hsnCode INTEGER,
            itcAvail TEXT,
            itcAvail2 TEXT,
            taxPercentageType TEXT,
            taxType Text,
            FOREIGN KEY (account_code) REFERENCES groups(group_code)
        )`,
    `CREATE TABLE IF NOT EXISTS ledger_party_contact (
            contact_id INTEGER PRIMARY KEY,
            firstName TEXT,
            lastName TEXT,
            gender TEXT,
            maritalStatus TEXT,
            designation TEXT,
            phone1 TEXT,
            phone2 TEXT NOT NULL,
            phone3 TEXT NOT NULL,
            website_input TEXT,
            emailId1 TEXT,
            emailId2 TEXT,
            party_id INTEGER,
            FOREIGN KEY (party_id) REFERENCES ledger_party(party_id)
              )`,
    `CREATE TABLE IF NOT EXISTS ledger_party_balance (
            balance_id INTEGER PRIMARY KEY,
            balancingMethod TEXT,
            openingBal REAL NOT NULL DEFAULT 0.00,
            openingBalType TEXT CHECK(openingBalType IN ('credit', 'debit')),
            creditDays INTEGER NOT NULL DEFAULT 0,
            party_id INTEGER,
            FOREIGN KEY (party_id) REFERENCES ledger_party(party_id)
        )`,
    `CREATE TABLE IF NOT EXISTS ledger_party_licence (
            license_id INTEGER PRIMARY KEY,
            drugLicenceNo TEXT,
            expiryDate DATE,
            party_id INTEGER,
            FOREIGN KEY (party_id) REFERENCES ledger_party(party_id)
        )`,
    `CREATE TABLE IF NOT EXISTS ledger_party_gst (
            gst_id INTEGER PRIMARY KEY,
            ledgerType TEXT,
            panCard TEXT,
            gstIn TEXT,
            payeeCategory TEXT,
            tdsApplicable TEXT,
            registrationDate DATE,
            party_id INTEGER,
            FOREIGN KEY (party_id) REFERENCES ledger_party(party_id)
        )`,
    `CREATE TABLE IF NOT EXISTS ledger_account_details (
            acc_detail_id INTEGER PRIMARY KEY,
            bankName TEXT,
            branchName TEXT,
            ifscCode TEXT,
            accountNumber TEXT,
            accountType TEXT,
            accountHolderName TEXT,
            party_id INTEGER,
            FOREIGN KEY (party_id) REFERENCES ledger_party(party_id)
        )`,
    `INSERT INTO states (state_code, state_name, union_territory) VALUES ${insertStatements.join(
      ", "
    )};`,
    `INSERT INTO groups (group_code, group_name, parent_code, type, isPredefinedGroup) VALUES ${insertGroups.join(
      ", "
    )};`,
    `INSERT INTO ledger_party (partyName, account_code, isPredefinedParty) VALUES ${insertPartyAccountGroup.join(
      ", "
    )};`,
  ],
  down: [
    "DROP TABLE IF EXISTS account_group",
    "DROP TABLE IF EXISTS stations",
    "DROP TABLE IF EXISTS states",
    "DROP TABLE IF EXISTS groups",
    "DROP TABLE IF EXISTS ledger_party",
  ],
};
// module.exports.insertQuery = `INSERT INTO states (state_code, state_name, union_territory) VALUES ${insertStatements.join(', ')};`;
