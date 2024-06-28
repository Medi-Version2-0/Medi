const Company = require("./../database/models/company");
const Groups = require("../database/models/groupsData.js");
const Station = require("../database/models/stations.js");
const LedgerParty = require("./../database/models/ledger_party");
const SalesPurchase = require("../database/models/sales_purchase");
const { getStationIdByName } = require("./stationService");
const { getSalesPurchaseIdByType } = require("./salesPurchaseService");
const company = new Company();
const groups = new Groups();
const station = new Station();
const ledgerParty = new LedgerParty();
const salesPurchase = new SalesPurchase();

module.exports.getAllCompany = (where = "", sort = "", limit = "") => {
  const data = company.getAll("", "", "", "", "");
  const stationData = station.getAll("", "station_name", "", "", "");
  const spData = salesPurchase.getAll("", "", "");

  return data.forEach((d) => {
    d.openingBalType = d.openingBalType === "Debit" ? "Dr" : "Cr";
    spData.forEach((sp) => {
      if (d.sales_id && d.sales_id === sp.sp_id) {
        d.sales = sp.sptype;
      }
      if (d.purchase_id && d.purchase_id === sp.sp_id) {
        d.purchase = sp.sptype;
      }
    });
    stationData.forEach((s) => {
      if (d.station_id && d.station_id === s.station_id) {
        d.stationName = s.station_name;
      }
    });
  });
};

module.exports.addCompany = (companyData) => {
  try {
    if (!companyData) {
      throw new Error("Company Info is required");
    }

    const stationId = getStationIdByName(companyData.stationName);
    const salesId = getSalesPurchaseIdByType(companyData.sales);
    const purchaseId = getSalesPurchaseIdByType(companyData.purchase);

    const ledgerPartyData = {
      partyName: companyData.companyName,
      account_code: 5,
      isPredefinedLedger: 0,
      station_id: stationId,
      address1: companyData.address1,
      address2: companyData.address2,
      address3: companyData.address3,
      stateInout: companyData.stateInOut === "Within State" ? "In" : "Out",
      openingBalType: companyData.openingBalType === "Dr" ? "Debit" : "Credit",
      openingBal: companyData.openingBal,
      drugLicenceNo1: companyData.drugLicenceNo1,
      gstIn: companyData.gstIn,
      country: "INDIA",
      mailTo: companyData.emailId1,
      emailId1: companyData.emailId2,
      emailId2: companyData.emailId3,
      phoneNumber: companyData.phoneNumber,
      partyType: "C",
    };

    ledgerParty.insert(ledgerPartyData);
    const parties = ledgerParty.getAll("", "", "", "");
    const party = parties.find(
      (party) => party.partyName === companyData.companyName
    );
    if (party) {
      companyData.party_id = party.party_id;
    }
    companyData.station_id = stationId;
    companyData.sales_id = salesId || null;
    companyData.purchase_id = purchaseId || null;
    companyData.openingBalType =
      companyData.openingBalType === "Dr" ? "Debit" : "Credit";
    companyData.stateInOut =
      companyData.stateInOut === "Within State" ? "In" : "Out";

    delete companyData.stationName;
    delete companyData.sales;
    delete companyData.purchase;

    return company.insert(companyData);
  } catch (error) {
    console.error("Error adding company:", error);
    throw error;
  }
};

module.exports.updatecompany = (company_id, companyData) => {
  const comp = company
    .getAll("", "", "", "", "")
    .find((company) => company.company_id === company_id);
  const stationId = getStationIdByName(companyData.stationName);
  const salesId = getSalesPurchaseIdByType(companyData.sales);
  const purchaseId = getSalesPurchaseIdByType(companyData.purchase);

  party_id = comp?.party_id;
  companyData.station_id = stationId;
  companyData.sales_id = salesId || null;
  companyData.purchase_id = purchaseId || null;
  companyData.openingBalType =
    companyData.openingBalType === "Dr" ? "Debit" : "Credit";
  companyData.stateInOut =
    companyData.stateInOut === "Within State" ? "In" : "Out";

  delete companyData.stationName;
  delete companyData.sales;
  delete companyData.purchase;

  const newLedger = {
    partyName: companyData.companyName,
    station_id: companyData.station_id,
    address1: companyData.address1,
    address2: companyData.address2,
    address3: companyData.address3,
    stateInout: companyData.stateInOut,
    openingBalType: companyData.openingBalType,
    openingBal: companyData.openingBal,
    drugLicenceNo1: companyData.drugLicenceNo1,
    gstIn: companyData.gstIn,
    mailTo: companyData.emailId1,
    emailId1: companyData.emailId2,
    emailId2: companyData.emailId3,
    phoneNumber: companyData.phoneNumber,
  };

  ledgerParty.update(party_id, newLedger, "party_id");
  return company.update(company_id, companyData, "company_id");
};

module.exports.deleteCompany = (companyId) => {
  const parties = ledgerParty.getAll("", "", "", "");
  const data = company
    .getAll("", "", "", "", "")
    .find((company) => company.company_id === companyId);
  if (data) {
    const party = parties.find((party) => party.party_id === data.party_id);
    if (party) {
      ledgerParty.delete(party.party_id, "party_id");
    } else {
      console.log("Party not found for the given company");
    }
  } else {
    console.log("Company not found");
  }
  return company.delete(companyId, "company_id");
};

module.exports.getAllSuggestions = (where = "", sort = "", limit = "") => {
  const data = ledgercompany.getAll(where, sort, limit);
  const groupData = groups
    .getAll("", "", "", "", "")
    .filter((group) => group.parent_code === null);
  const finalData = [];
  data.map((d) => {
    groupData.map((g) => {
      if (d.account_code === g.group_code) {
        finalData.push({
          company_code: d.company_id,
          companyName: d.companyName,
          account_group: g.group_name,
        });
      }
    });
  });
  return finalData;
};
