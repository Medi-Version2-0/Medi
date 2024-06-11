const { statesList } = require("../models/states");
const { groups } = require("../models/groups");
const { PartyList } = require("../models/party");
const { SalesPurchasePred } = require("../models/sales_purchase_pred");

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

const insertSalesPurchase = SalesPurchasePred.map((sp) => {
  let {spType, igst, cgst, sgst, salesPurchaseType} = sp;
  console.log("inside insert sales purchase =====> ", sp); 
  return `('${spType}', ${igst}, ${cgst}, ${sgst}, '${salesPurchaseType}')`; 
})

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
        state_code INTEGER,
        station_pinCode INTEGER,
        station_headQuarter TEXT,
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
    `CREATE TABLE IF NOT EXISTS party_table (
          party_id INTEGER PRIMARY KEY,
          partyName TEXT NOT NULL,
          account_code INTEGER NOT NULL,
          isPredefinedParty BOOLEAN NOT NULL,
          station_id INTEGER,
          mailTo TEXT,
          address1 TEXT,
          address2 TEXT,
          address3 TEXT,
          country TEXT,
          state TEXT,
          city TEXT,
          pinCode INTEGER,
          vatNumber TEXT,
          creditPrivilege INTEGER,
          transport TEXT,
          excessRate INTEGER,
          routeNo TEXT,
          party_cash_credit_invoice TEXT,
          deductDiscount TEXT,
          stateInout TEXT,
          stopNrx TEXT,
          stopHi TEXT,
          notPrinpba TEXT, 
          firstName TEXT,
          lastName TEXT, 
          phoneNumber TEXT,
          emailId1 TEXT,
          emailId2 TEXT,
          openingBal INTEGER,
          openingBalType TEXT CHECK(openingBalType IN ('credit', 'debit')),
          creditLimit INTEGER,
          creditDays TEXT,
          drugLicenceNo1 TEXT,
          drugLicenceNo2 TEXT,
          panCard TEXT,
          gstIn TEXT,
          bankName TEXT,
          branchName TEXT,
          ifscCode TEXT,
          accountNumber TEXT,
          accountType TEXT,
          accountHolderName TEXT
        )`,
    `CREATE TABLE IF NOT EXISTS sales_purchase (
          sp_id INTEGER PRIMARY KEY,
          spType TEXT NOT NULL,
          salesPurchaseType TEXT NOT NULL,
          igst INTEGER,
          cgst INTEGER,
          sgst INTEGER,
          stPer INTEGER,
          surCharge INTEGER,
          spNo INTEGER,
          column INTEGER,
          shortName TEXT,
          shortName2 TEXT
        )`,
    `INSERT INTO states (state_code, state_name, union_territory) VALUES ${insertStatements.join(
      ", "
    )};`,
    `INSERT INTO groups (group_code, group_name, parent_code, type, isPredefinedGroup) VALUES ${insertGroups.join(
      ", "
    )};`,
    `INSERT INTO party_table (partyName, account_code, isPredefinedParty) VALUES ${insertPartyAccountGroup.join(
      ", "
    )};`,
    `INSERT INTO sales_purchase (spType, igst, cgst, sgst, salesPurchaseType) VALUES ${insertSalesPurchase.join(
      ", "
    )};`,
  ],
  down: [
    "DROP TABLE IF EXISTS account_group",
    "DROP TABLE IF EXISTS stations",
    "DROP TABLE IF EXISTS states",
    "DROP TABLE IF EXISTS groups",
    "DROP TABLE IF EXISTS party_table",
    "DROP TABLE IF EXISTS sales_purchase",
  ],
};
