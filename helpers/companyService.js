const Company = require("./../database/models/company");
const Groups = require("../database/models/groupsData.js");
const Station = require("../database/models/stations.js");
const LedgerParty = require("./../database/models/ledger_party");
const SalesPurchase = require("../database/models/sales_purchase");
const company = new Company();
const groups = new Groups();
const station = new Station();
const ledgerParty = new LedgerParty();
const salesPurchase = new SalesPurchase();

module.exports.getAllCompany = (where = "", sort = "", limit = "") => {
    const data = company.getAll("", "", "", "", "");
    const stationData = station.getAll("", "station_name", "", "", "");
    const spData = salesPurchase.getAll("", "", "");

    data.forEach((d) => {
        d.openingBalType = d.openingBalType === "Debit" ? "Dr" : "Cr";
        spData.forEach((sp) => {
            if (d.sales_id && d.sales_id === sp.sp_id) {
                d.sales = sp.spType;
                console.log("Sales========", d.sales);
            }
            if (d.purchase_id && d.purchase_id === sp.sp_id) {
                d.purchase = sp.spType;
            }
        });
        stationData.forEach((s) => {
            if (d.station_id && d.station_id === s.station_id) {
                d.stationName = s.station_name;
            }
        });

    });
    return data;
};

module.exports.addCompany = async (companyData) => {
    try {
        if (companyData) {
            const [stationData, spData] = await Promise.all([
                station.getAll("", "station_name", "", "", ""),
                salesPurchase.getAll("", "", "")
            ]);
            stationData.map((station) => {
                if (companyData.stationName && (station.stationName.toLowerCase() === companyData.stationName.toLowerCase())) {
                    companyData.station_id = station.station_id;
                }
            });
            const spMap = new Map(spData.map(sp => [sp.spType, sp.sp_id]));
            companyData.sales_id = spMap.get(companyData.sales) || null;
            companyData.purchase_id = spMap.get(companyData.purchase) || null;
            companyData.openingBalType = companyData.openingBalType === "Dr" ? "Debit" : "Credit";
            companyData.stateInout = companyData.stateInout === "Within State" ? "In" : "Out";

            delete companyData.stationName;
            delete companyData.sales;
            delete companyData.purchase;

            const newLedger = {
                partyName: companyData.companyName,
                account_code: 5,
                isPredefinedParty: 0,
                address1: companyData.address1,
                address2: companyData.address2,
                address3: companyData.address3,
                stateInout: companyData.stateInout,
                openingBalType: companyData.openingBalType,
                openingBal: companyData.openingBal,
                drugLicenceNo1: companyData.drugLicenceNo1,
                gstIn: companyData.gstIn,
                vatNumber: companyData.vatNumber,
                emailId1: companyData.emailId1,
                emailId2: companyData.emailId2,
                phoneNumber: companyData.phoneNumber,
                partyType: 'C',
            };
            const insertedLedger = await ledgerParty.insert(newLedger);
            companyData.party_id = insertedLedger.party_id;
            const insertedCompany = await company.insert(companyData);
            return insertedCompany;
        } else {
            throw new Error("Company Info  is required");
        }
    } catch (error) {
        console.error("Error adding company:", error);
        throw error;
    }
};


module.exports.updatecompany = (company_id, companyData) => {
    const data = station.getAll("", "station_name", "", "", "");
    const groupData = groups
        .getAll("", "", "", "", "")
        .filter((group) => group.parent_code === null);

    if (companyData) {
        groupData.forEach((s) => {
            if (companyData.accountGroup.toLowerCase() === s.group_name.toLowerCase()) {
                companyData.account_code = s.group_code;
            }
        });

        data.forEach((s) => {
            if (companyData.stationName.toLowerCase() === s.station_name.toLowerCase()) {
                companyData.station_id = s.station_id;
            }
        });
    }

    companyData.isPredefinedcompany = 0;
    delete companyData.accountGroup;
    delete companyData.stationName;

    // for balance-info
    if (companyData) {
        !!companyData.openingBalType
            ? (companyData.openingBalType =
                companyData.openingBalType === "Dr" ? "Debit" : "Credit")
            : "";
        companyData.stateInout =
            companyData.stateInout === "Within State" ? "In" : "Out"
            ;
        !!companyData.company_cash_credit_invoice
            ? (companyData.company_cash_credit_invoice =
                companyData.company_cash_credit_invoice === "Cash Invoice"
                    ? "Cash_Invoice"
                    : "Credit_Invoice")
            : "";
    }

    return ledgercompany.update(company_id, companyData, "company_id");
};

module.exports.deleteLedger = (company_id) => {
    ledgercompany.delete(company_id, "company_id");
    return;
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
