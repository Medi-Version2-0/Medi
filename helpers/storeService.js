const Store = require("../database/models/store");
const store = new Store();

module.exports.getAll = (where='', sort='', limit='', type="") => {
  const data = store.getAll(where, sort, limit);
  return data ;
}