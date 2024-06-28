const LedgerParty = require("./../database/models/ledger_party");
const Groups = require("../database/models/groupsData.js");
const Station = require("../database/models/stations.js");

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
    s.isPredefinedLedger = s.isPredefinedLedger === 1 ? true : false;
    s.openingBalType =
      s.isPredefinedLedger === true
        ? ""
        : s.openingBalType === "Debit"
        ? "Dr"
        : "Cr";
    s.partyType =
      s.isPredefinedLedger === true
        ? ""
        : s.partyType === "B"
        ? "Balance Sheet"
        : s.partyType === "P"
        ? "P & L"
        : s.partyType;
    s.stateInout =
      s.isPredefinedLedger !== true
        ? s.stateInout === "In"
          ? "Within State"
          : "Out Of State"
        : "";
    s.party_cash_credit_invoice =
      s.isPredefinedLedger !== true
        ? s.party_cash_credit_invoice === "Cash_Invoice"
          ? "Cash Invoice"
          : "Credit Invoice"
        : "";
  });

  data.forEach((d) => {
    stationData.forEach((s) => {
      if (d.station_id && d.station_id === s.station_id) {
        d.stationName = s.station_name;
      }
    });
  });
  const filteredData = [];
  data.forEach((d) => {
    if (d.partyType !== "C") {
      filteredData.push(d);
    }
  });
  return filteredData;
};

module.exports.addParty = (partyData) => {
  try {
    // const data = station.getAll("", "station_name", "", "", "");
    // const groupData = groups.getAll("", "", "", "", "").filter(
    //   (group) => group.parent_code === null
    // );

    // if (partyData) {
    //   groupData.forEach((s) => {
    //     if (partyData.accountGroup.toLowerCase() === s.group_name.toLowerCase()) {
    //       partyData.account_code = s.group_code;
    //     }
    //   });

    //   data.forEach((s) => {
    //     if (partyData.stationName && partyData.stationName.toLowerCase() === s.station_name.toLowerCase()) {
    //       partyData.station_id = s.station_id;
    //     }
    //   });
console.log("this is partyData",partyData)
    partyData.isPredefinedLedger = 0;
    // delete partyData.accountGroup;
    // delete partyData.stationName;

    // for balance-info

    const insertedParty = ledgerParty.insert(partyData);

    return insertedParty;
    // } else {
    //   throw new Error("general_info is required in partyData");
    // }
  } catch (error) {
    console.error("Error adding party:", error);
    throw error;
  }
};

module.exports.updateParty = (party_id, partyData) => {
 

  partyData.isPredefinedLedger = 0;
  delete partyData.accountGroup;
  delete partyData.stationName;

  // for balance-info
  if (partyData) {
    !!partyData.openingBalType
      ? (partyData.openingBalType =
          partyData.openingBalType === "Dr" ? "Debit" : "Credit")
      : "";
    partyData.partyType = partyData.partyType === "Balance Sheet" ? "B" : "P";
    partyData.stateInout =
      partyData.stateInout === "Within State"
        ? "In"
        : partyData.stateInout === "Out Of State"
        ? "Out"
        : "";
    !!partyData.party_cash_credit_invoice
      ? (partyData.party_cash_credit_invoice =
          partyData.party_cash_credit_invoice === "Cash Invoice"
            ? "Cash_Invoice"
            : "Credit_Invoice")
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
