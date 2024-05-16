const { contextBridge } = require('electron');

const Station = require('./database/models/stations.js');
const States = require('./database/models/statesData.js');
const Account_groups = require('./database/models/account_group.js');
const Groups = require('./database/models/groupsData.js');

const stationService = require('./helpers/stationService.js');
const groupService = require('./helpers/groupService.js');
const accountGroupService = require('./helpers/accountGroupService.js');

const station = new Station()
const account_groups = new Account_groups()
const states = new States()
const groups = new Groups()

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
});
