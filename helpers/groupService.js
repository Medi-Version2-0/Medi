const Groups = require('../database/models/groupsData.js');

const groups = new Groups();

module.exports.getAll = (where='', sort='', limit='') => {
    const groupData = groups.getAll(where, sort, limit).filter(group => group.parent_code === null);
    groupData.map((group) => {
      group.isPredefinedGroup = group.isPredefinedGroup === 1 ? true : false;
    }) 
    return groupData; 
  }

  module.exports.addGroup = (groupData) => {
    groupData.isPredefinedGroup = 0; 
    groupData.parent_code = null; 
    groups.insert(groupData);
  }

  module.exports.getAllSubGroups =  (where = "", sort = "", limit = "") => {
    const groupData = groups.getAll(where, sort, limit).filter(group => group.parent_code !== null);
    groupData.map((group) => {
      group.isPredefinedGroup = group.isPredefinedGroup === 1 ? true : false;
    }) 
    const group = groups.getAll(where, sort, limit);

    groupData.map((d) => {
      group.map((g) => {
        if(d.parent_code === g.group_code){
          d.parent_group = g.group_name;
        }
      })
    })
    return groupData;
  }

  module.exports.addSubGroup = (groupData) => {
    groupData.isPredefinedGroup = 0; 
    groups.insert(groupData);
  }
