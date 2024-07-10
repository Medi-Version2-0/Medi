import React from 'react';
import { TopBar } from '../../components/TopBar';
import { Tabs } from '../../components/tabs/Tabs';

const Layout = () => {
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
