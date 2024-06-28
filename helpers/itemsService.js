const Item = require("./../database/models/items");
const item = new Item();

module.exports.getAllItems = (where = "", sort = "", limit = "") => {
  const data = item.getAll(where, sort, limit, "", "");
  return data;
};

module.exports.addItem = (itemData) => {
  try {
    if (itemData) {
      const insertedItem = item.insert(itemData);
      return insertedItem;
    } else {
      throw new Error("Item Info is required");
    }
  } catch (error) {
    console.error("Error adding company:", error);
    throw error;
  }
};
