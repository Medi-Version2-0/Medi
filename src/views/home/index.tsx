import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { TopBar } from '../../components/TopBar';
import { Tabs } from '../../components/tabs/Tabs';
import { setOrganization, setPermissions, setStation } from '../../store/action/globalAction';
import { sendAPIRequest } from '../../helper/api';
import { useParams } from 'react-router-dom';
import { getUserPermissions } from '../../api/permissionsApi';
import { ResourceI } from '../organization/types';
import { useUser } from '../../UserContext';
import { getOrganizations } from '../../api/organizationApi';

const Layout = () => {
  const dispatch = useDispatch();
  const { organizationId } = useParams();
  const { user, logout } = useUser();

  useEffect(() => {
    if (organizationId) {
      setMetaData()
    } else {
      logout();
    }
  }, []);

  const setMetaData = async () => {
    const stations = await sendAPIRequest<any[]>(`/${organizationId}/station`);
    const organizations = await getOrganizations(user?.id);
    const userRole: any = await getUserPermissions(Number(organizationId), Number(1));
    const permissions: any = {};
    userRole.role.Resources.forEach((resource: ResourceI) => {
      if (resource.RolePermission) {
        const { name } = resource;
        permissions[name.toLowerCase()] = {
          createAccess: resource.RolePermission.createAccess,
          readAccess: resource.RolePermission.readAccess,
          updateAccess: resource.RolePermission.updateAccess,
          deleteAccess: resource.RolePermission.deleteAccess
        };
      }
    });
    dispatch(setPermissions(permissions || {}));
    dispatch(setOrganization(organizations || []));
    dispatch(setStation(stations || []));
  }
  return (
    <>
      <TopBar />
      <div className='flex flex-row w-full h-screen'>
        <Tabs />
      </div>
    </>
  );
};

export default Layout;
