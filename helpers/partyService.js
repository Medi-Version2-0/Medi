const LedgerParty = require("./../database/models/ledger_party");
const Groups = require("../database/models/groupsData.js");
const Station = require("../database/models/stations.js");
const LedgerPartyContact = require("../database/models/ledger_party_contact");
const LedgerPartyBalance = require("../database/models/ledger_party_balance");
const LedgerPartyLicence = require("../database/models/ledger_party_licence");
const LedgerPartyGST = require("../database/models/ledger_party_gst");
const LedgerPartyAccountDetails = require("../database/models/ledger_account_details");

const station = new Station();
const groups = new Groups();
const ledgerParty = new LedgerParty();

module.exports.getAllLedgerData = (where = "", sort = "", limit = "") => {
  const stationData = station.getAll("", "station_name", "", "", "");
  const groupData = groups
    .getAll("", "", "", "", "")
    .filter((group) => group.parent_code === null);
  const data = ledgerParty.getAll("", "", "", "", "");

  data.forEach((d) => {
    groupData.forEach((g) => {
      if (d.account_code && d.account_code === g.group_code) {
        d.accountGroup = g.group_name;
      }
    });
  });

  data.forEach((s) => {
    
    s.isPredefinedParty = s.isPredefinedParty === 1 ? true : false;
      s.openingBalType = s.isPredefinedParty === true ? "" : s.openingBalType === "debit" ? "DR" : "CR";
    s.stateInout =
      s.isPredefinedParty !== true
        ? s.stateInout === "In"
          ? "With in State"
          : "Out of State"
        : "";
    s.party_cash_credit_invoice =
      s.isPredefinedParty !== false
        ? s.party_cash_credit_invoice === "Cash Invoice"
          ? "cash_invoice"
          : "credit_invoice"
        : "";
  });

  data.forEach((d) => {
    stationData.forEach((s) => {
      if (d.station_id && d.station_id === s.station_id) {
        d.stationName = s.station_name;
      }
    });
  });
  return data;
};

module.exports.addParty = async (partyData) => {
  try {
    const data = await station.getAll("", "station_name", "", "", "");
    const groupData = (await groups.getAll("", "", "", "", "")).filter(
      (group) => group.parent_code === null
    );

    if (partyData) {
      groupData.forEach((s) => {
        if (partyData.accountGroup === s.group_name) {
          partyData.account_code = s.group_code;
        }
      });

      data.forEach((s) => {
        if (partyData.stationName && partyData.stationName === s.station_name) {
          partyData.station_id = s.station_id;
        }
      });

      partyData.isPredefinedParty = 0;
      delete partyData.accountGroup;
      delete partyData.stationName;

      // for balance-info
      if (partyData) {
        partyData.openingBalType =
          partyData.openingBalType === "DR" ? "debit" : "credit";
        partyData.stateInout =
          !!partyData.stateInout && partyData.stateInout === "With in State"
            ? "In"
            : "Out";
        partyData.party_cash_credit_invoice =
          !!partyData.party_cash_credit_invoice &&
          partyData.party_cash_credit_invoice === "Cash Invoice"
            ? "cash_invoice"
            : "credit_invoice";
      }


      const insertedParty = await ledgerParty.insert(partyData);

      return insertedParty;
    } else {
      throw new Error("general_info is required in partyData");
    }
  } catch (error) {
    console.error("Error adding party:", error);
    throw error;
  }
};

module.exports.updateParty = (party_id, partyData) => {
  const data = station.getAll("", "station_name", "", "", "");
  const groupData = groups
    .getAll("", "", "", "", "")
    .filter((group) => group.parent_code === null);

  if (partyData) {
    groupData.forEach((s) => {
      if (partyData.accountGroup === s.group_name) {
        partyData.account_code = s.group_code;
      }
    });

    data.forEach((s) => {
      if (partyData.stationName === s.station_name) {
        partyData.station_id = s.station_id;
      }
    });
  }

  partyData.isPredefinedParty = 0;
  delete partyData.accountGroup;
  delete partyData.stationName;

  // for balance-info
  if (partyData) {
    !!partyData.openingBalType
      ? (partyData.openingBalType =
          partyData.openingBalType === "DR" ? "debit" : "credit")
      : "";
    partyData.stateInout =
          partyData.stateInout === "With in State" ? "In" : "Out"
      ;
    !!partyData.party_cash_credit_invoice
      ? (partyData.party_cash_credit_invoice =
          partyData.party_cash_credit_invoice === "Cash Invoice"
            ? "cash_invoice"
            : "credit_invoice")
      : "";
  }

  return ledgerParty.update(party_id, partyData, "party_id");
};

module.exports.deleteLedger = (party_id) => {
  ledgerParty.delete(party_id, "party_id");
  return;
};

module.exports.getAllSuggestions = (where = "", sort = "", limit = "") => {
  const data = ledgerParty.getAll(where, sort, limit);
  const groupData = groups
    .getAll("", "", "", "", "")
    .filter((group) => group.parent_code === null);
  const finalData = [];
  data.map((d) => {
    groupData.map((g) => {
      if (d.account_code === g.group_code) {
        finalData.push({
          party_code: d.party_id,
          partyName: d.partyName,
          account_group: g.group_name,
        });
      }
    });
  });
  return finalData;
};
