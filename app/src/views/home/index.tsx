import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/sidebar/Sidebar';

const Layout = () => {
  return (
    <div className='flex w-full'>
      <Sidebar />
      <div className='w-full'>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
