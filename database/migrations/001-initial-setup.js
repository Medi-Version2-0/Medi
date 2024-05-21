const { statesList } = require("../models/states");
const { groups } = require("../models/groups");

const insertStatements = statesList.map((state) => {
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

module.exports = {
  up: [
    `CREATE TABLE IF NOT EXISTS stations (
            station_id INTEGER PRIMARY KEY, 
            station_name TEXT NOT NULL, 
            cst_sale BOOLEAN DEFAULT FALSE, 
            state_code INTEGER NOT NULL,
            station_pinCode INTEGER,
            station_headQuarter TEXT NOT NULL, 
            FOREIGN KEY (state_code) REFERENCES states(state_code)
        )`,
    `CREATE TABLE IF NOT EXISTS states (
            state_code INTEGER PRIMARY KEY,
            state_name TEXT NOT NULL,
            union_territory boolean            
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
            party_name TEXT NOT NULL,
            account_code INTEGER NOT NULL,
            station_id INTEGER NOT NULL,
            email_id TEXT,
            address TEXT,
            country TEXT NOT NULL,
            state TEXT NOT NULL,
            city TEXT,
            pincode INTEGER,
            FOREIGN KEY (account_code) REFERENCES account_group(head_code)
        )`,
    `CREATE TABLE IF NOT EXISTS ledger_party_contact (
            contact_id INTEGER PRIMARY KEY,
            courtesy_titles TEXT,
            first_name TEXT,
            last_name TEXT,
            designation TEXT,
            phone_number TEXT,
            mobile_number1 TEXT NOT NULL,
            whatsapp_number TEXT NOT NULL,
            mobile_number3 TEXT,
            mobile_number4 TEXT,
            mobile_number5 TEXT,
            website TEXT,
            email_id TEXT,
            email_id2 TEXT,
            email_id3 TEXT,
            email_id4 TEXT,
            party_id INTEGER,
            FOREIGN KEY (party_id) REFERENCES ledger_party(party_id)
        )`,
    `CREATE TABLE IF NOT EXISTS ledger_party_licence (
            license_id INTEGER PRIMARY KEY,
            drug_lic_no TEXT,
            exp_date DATE,
            drug_lic_no1 TEXT,
            exp_date1 DATE,
            drug_lic_no2 TEXT,
            exp_date2 DATE,
            party_id INTEGER,
            FOREIGN KEY (party_id) REFERENCES ledger_party(party_id)
        )`,
    `CREATE TABLE IF NOT EXISTS ledger_party_balance (
            balance_id INTEGER PRIMARY KEY, 
            billing_method TEXT,
            opening_bal REAL NOT NULL DEFAULT 0.00, 
            type TEXT CHECK(type IN ('credit', 'debit')) 
            credit_days INTEGER NOT NULL DEFAULT 0,
            party_id INTEGER,
            FOREIGN KEY (party_id) REFERENCES ledger_party(party_id)
        )`,
    `CREATE TABLE IF NOT EXISTS ledger_gst_details (
            gst_id INTEGER PRIMARY KEY,
            ledger_type TEXT,
            pan_no TEXT,
            gstin TEXT,
            reg_date DATE,
            party_id INTEGER,
            FOREIGN KEY (party_id) REFERENCES ledger_party(party_id)
        )`,
    `CREATE TABLE IF NOT EXISTS ledger_account_details (
            acc_detail_id INTEGER PRIMARY KEY,
            bank TEXT,
            branch TEXT,
            ifsc_code TEXT,
            account_number TEXT,
            account_type TEXT,
            holder_name TEXT,
            party_id INTEGER,
            FOREIGN KEY (party_id) REFERENCES ledger_party(party_id)
        )`,
    `INSERT INTO states (state_code, state_name, union_territory) VALUES ${insertStatements.join(
      ", "
    )};`,
    `INSERT INTO groups (group_code, group_name, parent_code, type, isPredefinedGroup) VALUES ${insertGroups.join(
      ", "
    )};`,
  ],
  down: [
    "DROP TABLE IF EXISTS account_group",
    "DROP TABLE IF EXISTS stations",
    "DROP TABLE IF EXISTS states",
    "DROP TABLE IF EXISTS groups",
  ],
};
// module.exports.insertQuery = `INSERT INTO states (state_code, state_name, union_territory) VALUES ${insertStatements.join(', ')};`;
