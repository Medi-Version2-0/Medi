const SalesPurchase = require("../database/models/sales_purchase");
const salesPurchase = new SalesPurchase();

module.exports.addSalesPurchase = async (spData) => {
    try {
        const data = await salesPurchase.insert(spData);
        return data;
    } catch (error) {
      console.error("Error adding sales_purchase account:", error);
      throw error;
    }
  };