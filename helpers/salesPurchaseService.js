const SalesPurchase = require("../database/models/sales_purchase");
const salesPurchase = new SalesPurchase();

module.exports.getSalesPurchase = (where='', sort='', limit='', type="") => {
  const data = salesPurchase.getAll(where, sort, limit);
  if (type === 'Sales' || type === 'Purchase') {
    const filteredData = data.filter(item => item.salesPurchaseType === type);
    return filteredData;
} else {
    console.error("Invalid type:", type);
    return [];
}
}

module.exports.addSalesPurchase = async (spData) => {
    try {
        const data = await salesPurchase.insert(spData);
        return data;
    } catch (error) {
      console.error("Error adding sales_purchase account:", error);
      throw error;
    }
  };