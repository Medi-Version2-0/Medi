import { Dispatch } from 'redux';
import { ResourceI } from '../../views/organization/types';
import { SET_STATION, SET_GROUPS, SET_ORGANIZATION, SET_PERMISSIONS, GlobalActionTypes, SET_SALES, SET_PURCHASE, SET_COMPANY, SET_ITEMGROUP, SET_CONTROLROOMSETTINGS, SET_PARTY, SET_ITEM, SET_BILLBOOK, SET_SUB_GROUPS, SET_STORE, SET_PARTYWISE_DISCOUNT } from '../types/globalTypes';
import { sendAPIRequest } from '../../helper/api';
import { ItemGroupFormData, GroupFormData, SalesPurchaseFormData,  CompanyFormData, BillBookForm, BillBookFormData, LedgerFormData, ItemFormData, StoreFormData } from '../../interface/global';

export const getAndSetStations = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  try{
    const stations = await sendAPIRequest<any[]>(`/station`);

    dispatch({
      type: SET_STATION,
      payload: stations || [],
    });
  }catch(err){
    console.log('Error in station in redux --> ', err);
  }
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

export const getAndSetPermssions = (userId:number) => async (dispatch: Dispatch<GlobalActionTypes>) => {
  try{
    const userRole: any = await sendAPIRequest<any[]>(`/permissions/${userId}`);
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
  }catch(err){
    console.log('Error in permissions in redux --> ', err);
  }
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
  try{
    const itemGroups = await sendAPIRequest<ItemGroupFormData[]>(`/itemGroup`)
    dispatch({
      type: SET_ITEMGROUP,
      payload: itemGroups || [],
    });
  }catch (err) {
    console.log('Error in getting item groups in redux --> ', err);
  }
}

export const getAndSetCompany = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  try{
    const company = await sendAPIRequest<CompanyFormData[]>(`/company`)
    dispatch({
      type: SET_COMPANY,
      payload: company || [],
    });
  }catch (err) {
    console.log('Error in getting company in redux --> ', err);
  }
}

export const getAndSetPurchase = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  try{
    const purchase = await sendAPIRequest<SalesPurchaseFormData[]>(`/purchaseAccount`)
    dispatch({
      type: SET_PURCHASE,
      payload: purchase || [],
    });
  }catch(err) {
    console.log('Error in getting purchase in redux --> ', err);
  }
}

export const getAndSetSales = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  try{
    const sales = await sendAPIRequest<SalesPurchaseFormData[]>(`/saleAccount`)
    dispatch({
      type: SET_SALES,
      payload: sales || [],
    });
  }catch (err) {
    console.log('Error in getting sales in redux --> ', err);
  }
}

export const getAndSetGroups = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  try{
    const groups = await sendAPIRequest<GroupFormData[]>(`/group`)
    dispatch({
      type: SET_GROUPS,
      payload: groups || [],
    });
  }catch(err) {
    console.log('Error in getting groups in redux --> ', err);
  }
}
export const getAndSetSubGroups = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  try{
    const subGroups = await sendAPIRequest<GroupFormData[]>(`/subGroup`)
    dispatch({
      type: SET_SUB_GROUPS,
      payload: subGroups || [],
    });
  }catch (err) {
    console.log('Error in getting subGroups in redux --> ', err);
  }
}

export const getAndSetParty = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  try{
    const party = await sendAPIRequest<LedgerFormData[]>(`/ledger`)
    dispatch({
      type: SET_PARTY,
      payload: party || [],
    });
  }catch (err) {
    console.log('Error in getting party in redux --> ', err);
  }
}

export const getAndSetItem = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  try{
    const item = await sendAPIRequest<ItemFormData>(`/item`)
    dispatch({
      type: SET_ITEM,
      payload: item || [],
    });
  }catch(err){
    console.log('Error in getting item in redux --> ', err);
  }
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
  try{
    const billBookSeries = await sendAPIRequest<BillBookFormData[]>(`/billBook`)
    dispatch({
      type: SET_BILLBOOK,
      payload: billBookSeries || [],
    });
  }catch(err){
    console.log('Error in getting billBook in redux --> ', err);
  }
}

export const getAndSetStore = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  try{
    const store = await sendAPIRequest<StoreFormData[]>(`/store`)
    dispatch({
      type: SET_STORE,
      payload: store || [],
    });
  }catch(err) {
    console.log('Error in getting store in redux --> ', err);
  }
}

export const getAndSetPartywiseDiscount = () => async (dispatch: Dispatch<GlobalActionTypes>) => {
  try{
    const partywiseDiscount = await sendAPIRequest<StoreFormData[]>(`/partyWiseDiscount`)
    dispatch({
      type: SET_PARTYWISE_DISCOUNT,
      payload: partywiseDiscount || [],
    });
  }catch (err) {
    console.log('Error in getting partywise discount in redux --> ', err);
  }
}
