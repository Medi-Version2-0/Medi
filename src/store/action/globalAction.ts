import { Dispatch } from 'redux';
import { getUserPermissions } from '../../api/permissionsApi';
import { ResourceI } from '../../views/organization/types';
import { SET_STATION, SET_GROUPS, SET_ORGANIZATION, SET_PERMISSIONS, GlobalActionTypes, SET_SALES, SET_PURCHASE, SET_COMPANY, SET_ITEMGROUP, SET_CONTROLROOMSETTINGS, SET_PARTY, SET_ITEM, SET_BILLBOOK, SET_SUB_GROUPS, SET_STORE, SET_PARTYWISE_DISCOUNT } from '../types/globalTypes';
import { sendAPIRequest } from '../../helper/api';
import { ItemGroupFormData, GroupFormData, SalesPurchaseFormData,  CompanyFormData, BillBookForm, BillBookFormData, LedgerFormData, ItemFormData, StoreFormData } from '../../interface/global';

export const getAndSetStations = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  const stations = await sendAPIRequest<any[]>(`/station`);

  dispatch({
    type: SET_STATION,
    payload: stations || [],
  });
} 

export const setGroups = (groups: any): GlobalActionTypes => ({
  type: SET_GROUPS,
  payload: groups,
});
export const setSubGroups = (subGroups: any): GlobalActionTypes => ({
  type: SET_SUB_GROUPS,
  payload: subGroups,
});

export const setOrganization = (organizations: any): GlobalActionTypes => ({
  type: SET_ORGANIZATION,
  payload: organizations,
});

export const setPermissions = (permissions: any): GlobalActionTypes => ({
  type: SET_PERMISSIONS,
  payload: permissions,
});

export const getAndSetPermssions = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  const userRole: any = await getUserPermissions(Number(1));
  const permissions: any = {};
  userRole.role.Resources.forEach((resource: ResourceI) => {
    if (resource.RolePermission) {
      const { value } = resource;
      permissions[value.toLowerCase()] = {
        createAccess: resource.RolePermission.createAccess,
        readAccess: resource.RolePermission.readAccess,
        updateAccess: resource.RolePermission.updateAccess,
        deleteAccess: resource.RolePermission.deleteAccess
      };
    }
  });
  dispatch({
    type: SET_PERMISSIONS,
    payload: permissions,
  });
}

export const setSales = (sales: any): GlobalActionTypes => ({
  type: SET_SALES,
  payload: sales,
});

export const setPurchase = (purchase: any): GlobalActionTypes => ({
  type: SET_PURCHASE,
  payload: purchase,
});

export const setCompany = (company: any): GlobalActionTypes => ({
  type: SET_COMPANY,
  payload: company,
});

export const setItemGroups = (itemGroups: any): GlobalActionTypes => ({
  type: SET_ITEMGROUP,
  payload: itemGroups,
});

export const setBillBook = (billBookSeries: any): GlobalActionTypes => ({
  type: SET_BILLBOOK,
  payload: billBookSeries,
});

export const getAndSetItemGroups = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  const itemGroups = await sendAPIRequest<ItemGroupFormData[]>(`/itemGroup`)
  dispatch({
    type: SET_ITEMGROUP,
    payload: itemGroups ||[],
  });
}

export const getAndSetCompany = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  const company = await sendAPIRequest<CompanyFormData[]>(`/company`)
  dispatch({
    type: SET_COMPANY,
    payload: company ||[],
  });
}

export const getAndSetPurchase = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  const purchase = await sendAPIRequest<SalesPurchaseFormData[]>(`/purchase`)
  dispatch({
    type: SET_PURCHASE,
    payload: purchase ||[],
  });
}

export const getAndSetSales = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  const sales = await sendAPIRequest<SalesPurchaseFormData[]>(`/sale`)
  dispatch({
    type: SET_SALES,
    payload: sales ||[],
  });
}

export const getAndSetGroups = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  const groups = await sendAPIRequest<GroupFormData[]>(`/group`)
  dispatch({
    type: SET_GROUPS,
    payload: groups || [],
  });
}
export const getAndSetSubGroups = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  const subGroups = await sendAPIRequest<GroupFormData[]>(`/group/sub`)
  dispatch({
    type: SET_SUB_GROUPS,
    payload: subGroups || [],
  });
}

export const getAndSetParty = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  const party = await sendAPIRequest<LedgerFormData[]>(`/ledger`)
  dispatch({
    type: SET_PARTY,
    payload:  party|| [],
  });
}

export const getAndSetItem = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  const item = await sendAPIRequest< ItemFormData >(`/item`)
  dispatch({
    type: SET_ITEM,
    payload: item || [],
  });
}

export const setControlRoomSettings = (controlRoomSettings: any): GlobalActionTypes => ({
  type: SET_CONTROLROOMSETTINGS,
  payload: controlRoomSettings,
});

export const setParty = (party: any): GlobalActionTypes => ({
  type: SET_PARTY,
  payload: party,
});

export const setItem = (item: any): GlobalActionTypes => ({
  type: SET_ITEM,
  payload: item,
});

export const getAndSetBillBook = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  const billBookSeries = await sendAPIRequest<BillBookFormData[]>(`/billBook`)
  dispatch({
    type: SET_BILLBOOK,
  payload: billBookSeries || [],
  });
}

export const getAndSetStore = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  const store = await sendAPIRequest<StoreFormData[]>(`/store`)
  dispatch({
    type: SET_STORE,
    payload: store ||[],
  });
}

export const getAndSetPartywiseDiscount = (organizationId: string|undefined) => async (dispatch: Dispatch<GlobalActionTypes>) => {
  const partywiseDiscount = await sendAPIRequest<StoreFormData[]>(`/${organizationId}/partyWiseDiscount`)
  dispatch({
    type: SET_PARTYWISE_DISCOUNT,
    payload: partywiseDiscount ||[],
  });
}
