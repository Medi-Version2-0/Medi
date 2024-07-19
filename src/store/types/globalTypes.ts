export interface GlobalState {
    stations: any;
    groups: any;
  }
  
  export const SET_STATION = 'SET_STATION';
  export const SET_GROUPS = 'SET_GROUPS';
  
  interface SetStationAction {
    type: typeof SET_STATION;
    payload: any;
  }
  
  interface SetGroupsAction {
    type: typeof SET_GROUPS;
    payload: any;
  }
  
  export type GlobalActionTypes = SetStationAction | SetGroupsAction;
  