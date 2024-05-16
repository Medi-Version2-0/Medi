const { statesList } = require('../models/states');
const { groups } = require('../models/groups');

const insertStatements = statesList.map(state => {
    const { state_code, state_name, union_territory } = state;
    const unionTerritoryValue = union_territory ? 1 : 0;
    return `(${state_code}, '${state_name}', ${unionTerritoryValue})`;
});


const insertGroups = groups.map(group => {
    const { group_code, group_name, parent_code, type, isPredefinedGroup } = group;
    const isPredefinedGroupValue = isPredefinedGroup ? 1 : 0;
    return `(${group_code}, '${group_name}', ${parent_code}, '${type}', ${isPredefinedGroupValue})`;
});

module.exports = {
    up: [
        `CREATE TABLE IF NOT EXISTS stations (
            station_id INTEGER PRIMARY KEY, 
            station_name TEXT NOT NULL, 
            cst_sale BOOLEAN DEFAULT FALSE, 
            state_code INTEGER NOT NULL,
            station_pinCode INTEGER,
            FOREIGN KEY (state_code) REFERENCES states(state_code)
        )`,
        `CREATE TABLE IF NOT EXISTS states (
            state_code INTEGER PRIMARY KEY,
            state_name TEXT NOT NULL,
            union_territory boolean            
        )`,
        `CREATE TABLE IF NOT EXISTS groups (
            group_code INTEGER PRIMARY KEY,
            group_name TEXT NOT NULL,
            type TEXT CHECK (type IN ('p&l', 'balance sheet')) NOT NULL,
            parent_code INTEGER,
            isPredefinedGroup BOOLEAN NOT NULL,
            FOREIGN KEY (parent_code) REFERENCES groups(group_code)
        )`,  
        `CREATE TABLE IF NOT EXISTS account_group (
            head_code INTEGER PRIMARY KEY,
            head_name TEXT NOT NULL,
            parent_code INTEGER,
            FOREIGN KEY (parent_code) REFERENCES groups(group_code)
        )`,      
        `INSERT INTO states (state_code, state_name, union_territory) VALUES ${insertStatements.join(', ')};`,
        `INSERT INTO groups (group_code, group_name, parent_code, type, isPredefinedGroup) VALUES ${insertGroups.join(', ')};`
    ], 
    down: [
        'DROP TABLE IF EXISTS account_group',
        'DROP TABLE IF EXISTS stations',
        'DROP TABLE IF EXISTS states', 
        'DROP TABLE IF EXISTS groups'
    ]
};
// module.exports.insertQuery = `INSERT INTO states (state_code, state_name, union_territory) VALUES ${insertStatements.join(', ')};`;
