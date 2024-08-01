import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { TopBar } from '../../components/TopBar';
import { Tabs } from '../../components/tabs/Tabs';
import { setOrganization, setPermissions, setStation, setGroups, setSales, setPurchase, setCompany, setItemGroups } from '../../store/action/globalAction';
import { sendAPIRequest } from '../../helper/api';
import { useParams } from 'react-router-dom';
import { useUser } from '../../UserContext';
import { AppDispatch } from '../../store/types/globalTypes';
import useFetchInitialData from '../../hooks/useFetchInitialData';
import { GroupFormData, ItemGroupFormData } from '../../interface/global';

const Layout = () => {
  const { organizationId } = useParams();
  const { logout } = useUser();
  const dispatch = useDispatch()
  const {fetchInitialData} = useFetchInitialData(organizationId)
  useEffect(() => {
    if (organizationId) {
      fetchInitialData()
    } else {
      logout();
    }
  }, []);

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
