import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import { TopBar } from '../../components/TopBar';
import { Tabs } from '../../components/tabs/Tabs';
import { setStation } from '../../store/action/globalAction';
import { sendAPIRequest } from '../../helper/api';
import { useParams } from 'react-router-dom';

const Layout = () => {
  const { stations } = useSelector((state: any) => state.global)
  const dispatch = useDispatch()
  const { organizationId } = useParams();

  useEffect(() => {
    if (!stations.length && organizationId) {
      setStationData()
    }
  }, []);

  const setStationData = async () => {
    const stations = await sendAPIRequest<any[]>(`/${organizationId}/station`);
    dispatch(setStation(stations || []))
  }
  return (
    <>
      <TopBar />
      <div className='flex flex-row w-full h-screen'>
        <Tabs />

        {/* if needed to render standard component without tabs them use Outlet otherwise hide normal component */}
        {/* <div className='w-full'>
          <Outlet />
        </div> */}
      </div>
    </>
  );
};

export default Layout;
