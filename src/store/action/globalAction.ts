import { Dispatch } from 'redux';
import { getUserPermissions } from '../../api/permissionsApi';
import { ResourceI } from '../../views/organization/types';
import { SET_STATION, SET_GROUPS, SET_ORGANIZATION, SET_PERMISSIONS, GlobalActionTypes, SET_SALES, SET_PURCHASE, SET_COMPANY, SET_ITEMGROUP, GlobalState } from '../types/globalTypes';

export const setStation = (station: any): GlobalActionTypes => ({
  type: SET_STATION,
  payload: station,
});

export const setGroups = (groups: any): GlobalActionTypes => ({
  type: SET_GROUPS,
  payload: groups,
});

export const setOrganization = (organizations: any): GlobalActionTypes => ({
  type: SET_ORGANIZATION,
  payload: organizations,
});

export const setPermissions = (permissions: any): GlobalActionTypes => ({
  type: SET_PERMISSIONS,
  payload: permissions,
});

export const getAndSetPermssions = (organizationId: string|undefined) => async (dispatch: Dispatch<GlobalActionTypes>) => {
  const userRole: any = await getUserPermissions(Number(organizationId), Number(1));
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