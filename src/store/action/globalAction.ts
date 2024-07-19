import { SET_STATION, SET_GROUPS, GlobalActionTypes } from '../types/globalTypes';

export const setStation = (station: any): GlobalActionTypes => ({
  type: SET_STATION,
  payload: station,
});

export const setGroups = (groups: any): GlobalActionTypes => ({
  type: SET_GROUPS,
  payload: groups,
});
