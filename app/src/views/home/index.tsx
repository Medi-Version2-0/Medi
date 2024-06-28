import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/sidebar/Sidebar';
import { TopBar } from '../../components/TopBar';

const Layout = () => {
  return (
    <>
      <TopBar />
      <div className='flex w-full'>
        <Sidebar />
        <div className='w-full'>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;
