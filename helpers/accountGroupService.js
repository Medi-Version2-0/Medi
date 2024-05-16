const Account_groups = require("./../database/models/account_group.js");
const Groups = require("../database/models/groupsData.js");
const groups = new Groups();
const account_groups = new Account_groups();
module.exports.addAccountGroup = (groupData) => {
  account_groups.insert(groupData);
};

module.exports.getAllAccountGroups = async (
  where = "",
  sort = "",
  limit = ""
) => {
  const groupData = account_groups.getAll(where, sort, limit);

  const groupCodes = groupData.map((group) => group.parent_code);

  const groupDetails = await Promise.all(
    groupCodes.map(async (parent_code) => {
      const groupDetail = await queryGroupByParentCode(parent_code);
      return groupDetail;
    })
  );

  const result = groupData.map((group, index) => ({
    ...group,
    group_details: groupDetails[index],
  }));

  return result;
};

async function queryGroupByParentCode(parent_code) {
  const groupDetail = await groups.getByField("group_code", parent_code);
  return groupDetail;
}
