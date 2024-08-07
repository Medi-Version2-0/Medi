import { useEffect } from 'react';
import { TopBar } from '../../components/TopBar';
import { Tabs } from '../../components/tabs/Tabs';
import { useParams } from 'react-router-dom';
import { useUser } from '../../UserContext';
import useFetchInitialData from '../../hooks/useFetchInitialData';

const Layout = () => {
  const { organizationId } = useParams();
  const { logout } = useUser();
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
