export interface GlobalState {
  stations: any;
  groups: any;
  organizations: any;
  permissions: any;
}

export const SET_STATION = 'SET_STATION';
export const SET_GROUPS = 'SET_GROUPS';
export const SET_ORGANIZATION = 'SET_ORGANIZATION';
export const SET_PERMISSIONS = 'SET_PERMISSIONS';

interface SetStationAction {
  type: typeof SET_STATION;
  payload: any;
}

interface SetGroupsAction {
  type: typeof SET_GROUPS;
  payload: any;
}

interface SetOrganizationAction {
  type: typeof SET_ORGANIZATION;
  payload: any;
}

interface SetPermissionsAction {
  type: typeof SET_PERMISSIONS;
  payload: any;
}

export type GlobalActionTypes = SetStationAction | SetGroupsAction | SetOrganizationAction | SetPermissionsAction;
