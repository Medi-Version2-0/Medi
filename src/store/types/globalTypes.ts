export interface GlobalState {
  stations: any;
  groups: any;
  organizations: any;
  permissions: any;
  sales: any;
  purchase: any;
  company: any;
  itemGroups: any;
}

export const SET_STATION = 'SET_STATION';
export const SET_GROUPS = 'SET_GROUPS';
export const SET_ORGANIZATION = 'SET_ORGANIZATION';
export const SET_PERMISSIONS = 'SET_PERMISSIONS';
export const SET_SALES = 'SET_SALES';
export const SET_PURCHASE = 'SET_PURCHASE';
export const SET_COMPANY = 'SET_COMPANY';
export const SET_ITEMGROUP = 'SET_ITEMGROUP';

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

interface SetSalesAction {
  type: typeof SET_SALES;
  payload: any;
}

interface SetPurchaseAction {
  type: typeof SET_PURCHASE;
  payload: any;
}

interface SetCompanyAction {
  type: typeof SET_COMPANY;
  payload: any;
}

interface SetItemGroupAction {
  type: typeof SET_ITEMGROUP;
  payload: any;
}
export type GlobalActionTypes = SetStationAction | SetGroupsAction | SetOrganizationAction | SetPermissionsAction | SetSalesAction | SetPurchaseAction | SetCompanyAction | SetItemGroupAction;
