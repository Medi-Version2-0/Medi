const SalesPurchase = require("../database/models/sales_purchase");
const salesPurchase = new SalesPurchase();

module.exports.getSalesPurchase = (
  where = "",
  sort = "",
  limit = "",
  type = ""
) => {
  const data = salesPurchase.getAll(where, sort, limit);
  if (type === "Sales" || type === "Purchase") {
    const filteredData = data.filter((item) => item.salesPurchaseType === type);
    return filteredData;
  } else {
    console.error("Invalid type:", type);
    return [];
  }
};

module.exports.addSalesPurchase = (spData) => {
  try {
    spData.cgst = (parseFloat(spData.igst) / 2).toFixed(2);
    spData.sgst = (parseFloat(spData.igst) / 2).toFixed(2);
    const data = salesPurchase.insert(spData);
    return data;
  } catch (error) {
    console.error("Error adding sales_purchase account:", error);
    throw error;
  }
};

module.exports.updateSalesPurchase = (sp_id, spData) => {
  try {
    spData.cgst = (parseFloat(spData.igst) / 2).toFixed(2);
    spData.sgst = (parseFloat(spData.igst) / 2).toFixed(2);
    return salesPurchase.update(sp_id, spData, "sp_id");
  } catch (error) {
    console.error("Error updating sales_purchase account:", error);
    throw error;
  }
};
module.exports.getSalesPurchaseIdByType = (sptype) => {
  try {
    const spData = salesPurchase.getAll('', '', '');
    const spFound = spData.find((sp) => sp.sptype === sptype);
    return spFound ? spFound.sp_id : null;
  } catch (error) {
    console.error('Error getting sales/purchase ID:', error);
    throw error;
  }
};
