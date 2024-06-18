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

module.exports.addSalesPurchase = async (spData) => {
  try {
    spData.cgst = (parseFloat(spData.igst) / 2).toFixed(2);
    spData.sgst = (parseFloat(spData.igst) / 2).toFixed(2);
    const data = await salesPurchase.insert(spData);
    return data;
  } catch (error) {
    console.error("Error adding sales_purchase account:", error);
    throw error;
  }
};

module.exports.updateSalesPurchase = async (sp_id, spData) => {
  try {
    spData.cgst = (parseFloat(spData.igst) / 2).toFixed(2);
    spData.sgst = (parseFloat(spData.igst) / 2).toFixed(2);
    return await salesPurchase.update(sp_id, spData, "sp_id");
  } catch (error) {
    console.error("Error updating sales_purchase account:", error);
    throw error;
  }
};
