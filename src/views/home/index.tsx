import { useEffect } from 'react';
import { TopBar } from '../../components/TopBar';
import { Tabs } from '../../components/tabs/Tabs';
import { useUser } from '../../UserContext';
import useFetchInitialData from '../../hooks/useFetchInitialData';

const Layout = () => {
  const { user, logout } = useUser();
  const {fetchInitialData} = useFetchInitialData()
  useEffect(() => {
    if (user?.organizationId) {
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
