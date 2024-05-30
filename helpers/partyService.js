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
const contacts = new LedgerPartyContact();
const balance = new LedgerPartyBalance();
const licence = new LedgerPartyLicence();
const gstDetails = new LedgerPartyGST();
const accountDetails = new LedgerPartyAccountDetails();

module.exports.addParty = async (partyData) => {
  let PartyCode = await ledgerParty.getAll("", "", "", "", "");
  if (PartyCode.length > 0) {
    PartyCode = PartyCode[PartyCode.length - 1].party_id;
  }
  
  try {
    const data = await station.getAll("", "station_name", "", "", "");
    const groupData = (await groups.getAll("", "", "", "", "")).filter(
      (group) => group.parent_code === null
    );

    if (partyData.general_info) {
      groupData.forEach((s) => {
        if (partyData.general_info.accountGroup === s.group_name) {
          partyData.general_info.account_code = s.group_code;
        }
      });

      data.forEach((s) => {
        if (partyData.general_info.stationName === s.station_name) {
          partyData.general_info.station_id = s.station_id;
        }
      });

      partyData.general_info.isPredefinedParty = 0;
      delete partyData.general_info.accountGroup;
      delete partyData.general_info.stationName;

      const insertedParty = await ledgerParty.insert(partyData.general_info);

      // for balance-info
      if (
        partyData.balance_contact_info &&
        partyData.balance_contact_info.balance_info
      ) {
        partyData.balance_contact_info.balance_info.party_id = PartyCode + 1;
        partyData.balance_contact_info.balance_info.openingBalType =
          partyData.balance_contact_info.balance_info.openingBalType === "DR"
            ? "debit"
            : "credit";
        await balance.insert(partyData.balance_contact_info.balance_info);
      }

      // for contacts

      if (
        (partyData.balance_contact_info &&
          partyData.balance_contact_info.contacts_info) ||
        (partyData.tax_personal_details &&
          partyData.tax_personal_details.personal_info)
      ) {
        const data = {
          party_id: PartyCode + 1,
          firstName: partyData.tax_personal_details.personal_info.firstName,
          lastName: partyData.tax_personal_details.personal_info.lastName,
          gender: partyData.tax_personal_details.personal_info.gender,
          maritalStatus:
            partyData.tax_personal_details.personal_info.maritalStatus,
          designation: partyData.tax_personal_details.personal_info.designation,
          website_input:
            partyData.tax_personal_details.personal_info.website_input,
          emailId1: partyData.tax_personal_details.personal_info.emailId1,
          emailId2: partyData.tax_personal_details.personal_info.emailId2,
          phone1: partyData.balance_contact_info.contacts_info.phone1,
          phone2: partyData.balance_contact_info.contacts_info.phone2,
          phone3: partyData.balance_contact_info.contacts_info.phone3,
        };
        await contacts.insert(data);
      }

      // for licence part
      if (
        partyData.tax_personal_details &&
        partyData.tax_personal_details.licence_info
      ) {
        partyData.tax_personal_details.licence_info.party_id = PartyCode + 1;
        await licence.insert(partyData.tax_personal_details.licence_info);
      }

      // for gst Part
      if (
        partyData.tax_personal_details &&
        partyData.tax_personal_details.gst_data
      ) {
        partyData.tax_personal_details.gst_data.party_id = PartyCode + 1;
        await gstDetails.insert(partyData.tax_personal_details.gst_data);
      }

      // for bankDetails Part
      if (
        partyData.tax_personal_details &&
        partyData.tax_personal_details.bank_details
      ) {
        partyData.tax_personal_details.bank_details.party_id = PartyCode + 1;
        await accountDetails.insert(
          partyData.tax_personal_details.bank_details
        );
      }

      return insertedParty;
    } else {
      throw new Error("general_info is required in partyData");
    }
  } catch (error) {
    console.error("Error adding party:", error);
    throw error;
  }
};

module.exports.getAllLedgerData = (where = "", sort = "", limit = "") => {
  const stationData = station.getAll("", "station_name", "", "", "");
  const groupData = groups.getAll("", "", "", "", "").filter(
    (group) => group.parent_code === null
  );
  const data =  ledgerParty.getAllLedgerDataQuery("", "", "", "", "");

  data.forEach((d) => {
    groupData.forEach((g) => {
      if(d.account_code && d.account_code === g.group_code){
        d.accountGroup = g.group_name;
      } 
    })
  })

  data.forEach((s) => {
    s.isPredefinedParty = s.isPredefinedParty === 1 ? true : false;
  });

  data.forEach((d) => {
    stationData.forEach((s) => {
      if(d.station_id && d.station_id === s.station_id){
        d.stationName = s.station_name;
      } 
    })
  })

  return data;
}

module.exports.deleteLedger = (party_id) => {
  balance.delete(party_id, 'party_id');
  contacts.delete(party_id, 'party_id');
  licence.delete(party_id, 'party_id');
  gstDetails.delete(party_id, 'party_id');
  accountDetails.delete(party_id, 'party_id');
  ledgerParty.delete(party_id, 'party_id');
  return;
}

module.exports.getAllSuggestions = (where = "", sort = "", limit = "") => {
  const data = ledgerParty.getAll(where, sort, limit);
  const groupData = groups.getAll("", "", "", "", "").filter((group) => group.parent_code === null);
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
