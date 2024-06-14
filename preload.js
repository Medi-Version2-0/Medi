const { contextBridge } = require('electron');

const Station = require('./database/models/stations.js');
const States = require('./database/models/statesData.js');
const Account_groups = require('./database/models/account_group.js');
const Groups = require('./database/models/groupsData.js');
const SalesPurchase = require("./database/models/sales_purchase.js");
const Store = require("./database/models/store.js");

const stationService = require('./helpers/stationService.js');
const groupService = require('./helpers/groupService.js');
const accountGroupService = require('./helpers/accountGroupService.js');
const partyService =require('./helpers/partyService.js');
const salesPurchaseService = require('./helpers/salesPurchaseService.js');
const storeService = require('./helpers/storeService.js');

const station = new Station()
const account_groups = new Account_groups()
const states = new States()
const groups = new Groups()
const salesPurchase = new SalesPurchase()
const store = new Store()

contextBridge.exposeInMainWorld("electronAPI", {
  // STATIONS SERVICE

  getAllStations : (where = "", sort = "", limit = "") => stationService.getAll(where, sort, limit),  
  addStation: (stationData) => station.insert(stationData),
  updateStation: (id, stationData) => station.update(id, stationData, 'station_id'),  
  deleteStation: (station_id) => station.delete(station_id, "station_id"),

  // Account Group functions

  getAllAccountGroups: (where = "", sort = "", limit = "") => accountGroupService.getAllAccountGroups(where, sort, limit),
  addAccountGroup: (groupData) => accountGroupService.addAccountGroup(groupData),
  updateAccountGroup: (id, groupData) => account_groups.update(id, groupData, 'head_code'),
  deleteAccountGroup: (head_code) => account_groups.delete(head_code, "head_code"),

  // States functions :

  getAllStates:  (where = "", sort = "", limit = "") => states.getAll(where, sort, limit),

  // Groups functions : 
  getAllGroups : (where = "", sort = "", limit = "") => groupService.getAll(where, sort, limit), 
  addGroup : (groupData) => groupService.addGroup(groupData),
  updateGroup: (id, groupData) => groups.update(id, groupData, 'group_code'),
  deleteGroup: (group_code) => groups.delete(group_code, "group_code"),

   // Sub groups functions : 
  getAllSubGroups:  (where = "", sort = "", limit = "") => groupService.getAllSubGroups(where, sort, limit),
  addSubGroup: (groupData) => groupService.addSubGroup(groupData),
  updateSubGroup: (id, groupData) => groups.update(id, groupData, 'group_code'),
  deleteSubGroup: (group_code) => groups.delete(group_code, "group_code"),

  // ledger party
  addParty:(partyData)=> partyService.addParty(partyData),
  getAllLedgerData: (where = "", sort = "", limit = "") => partyService.getAllLedgerData(where, sort, limit),
  updateParty: (party_id, partyData) => partyService.updateParty(party_id, partyData),
  deleteLedger: (party_id) => partyService.deleteLedger(party_id),

  // Sales Purchase
  addSalesPurchase:(spData)=> salesPurchaseService.addSalesPurchase(spData),
  getSalesPurchase: (where = "", sort = "", limit = "", type="") => salesPurchaseService.getSalesPurchase(where, sort, limit, type),
  deleteSalesPurchase: (sp_id) => salesPurchase.delete(sp_id, 'sp_id'),
  updateSalesPurchase: (sp_id, spData) => salesPurchase.update(sp_id, spData, 'sp_id'),

  // Store
  getAllStores : (where = "", sort = "", limit = "") => storeService.getAll(where, sort, limit),  
  addStore: (storeData) => store.insert(storeData),
  updateStore: (id, storeData) => store.update(id, storeData, 'store_code'),  
  deleteStore: (store_code) => store.delete(store_code, "store_code"),


  // suggestion List for different inputs 
  addSuggestionList:(where = "", sort = "", limit = "")=> partyService.getAllSuggestions(where, sort, limit),
});
