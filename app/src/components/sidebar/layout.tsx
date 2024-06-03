import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import './layout.css';

const Layout = () => {
  return (
    <div className='layout'>
      <Sidebar />
      <div className='main_content'>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
