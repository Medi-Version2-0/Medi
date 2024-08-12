import { ThunkDispatch } from "redux-thunk";
export interface GlobalState {
  stations: any;
  groups: any;
  ledgerParty: any;
  organizations: any;
  permissions: any;
  sales: any;
  purchase: any;
  company: any;
  itemGroups: any;
  controlRoomSettings: any;
  party: any;
  item: any;
  billBookSeries: any;
}

export const SET_STATION = 'SET_STATION';
export const SET_GROUPS = 'SET_GROUPS';
export const SET_LEDGER = 'SET_LEDGER';
export const SET_ORGANIZATION = 'SET_ORGANIZATION';
export const SET_PERMISSIONS = 'SET_PERMISSIONS';
export const SET_SALES = 'SET_SALES';
export const SET_PURCHASE = 'SET_PURCHASE';
export const SET_COMPANY = 'SET_COMPANY';
export const SET_ITEMGROUP = 'SET_ITEMGROUP';
export const SET_CONTROLROOMSETTINGS = 'SET_CONTROLROOMSETTINGS';
export const SET_PARTY = 'SET_PARTY'
export const SET_ITEM = 'SET_ITEM'
export const SET_BILLBOOK = 'SET_BILLBOOK';

interface SetStationAction {
  type: typeof SET_STATION;
  payload: any;
}

interface SetGroupsAction {
  type: typeof SET_GROUPS;
  payload: any;
}
interface SetLedgerPartyAction {
  type: typeof SET_LEDGER;
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
interface SetControlRoomSettings {
  type: typeof SET_CONTROLROOMSETTINGS;
  payload: any;
}

interface SetParty {
  type: typeof SET_PARTY;
  payload: any;
}

interface SetItem {
  type: typeof SET_ITEM;
  payload: any;
}
interface setBillBookAction {
  type: typeof SET_BILLBOOK;
  payload: any;
}

export type GlobalActionTypes = SetStationAction | SetGroupsAction | SetOrganizationAction | SetPermissionsAction | SetSalesAction | SetPurchaseAction | SetCompanyAction | SetItemGroupAction | SetControlRoomSettings | SetParty | SetItem | setBillBookAction;
export type AppDispatch = ThunkDispatch<GlobalState, void, GlobalActionTypes>;
