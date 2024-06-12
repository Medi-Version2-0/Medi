const Station = require("../database/models/stations.js");
const States = require("../database/models/statesData.js");

const station = new Station();
const states = new States();

module.exports.getAll = (where = "", sort = "", limit = "") => {
  const data = station.getAll(where, sort, limit);
  const state = states.getAll("", "state_name", "", "", "");
  data.map((d) => {
    state.map((s) => {
      if (d.state_code === s.state_code) {
        d.station_state = s.state_name;
      }
    });
  });
  data.map((d) => {
    data.map((s) => {
      if (d.station_headQuarter === s.station_id) {
        d.station_headQuarter = s.station_name;
      }
    });
  });
  return data;
};
