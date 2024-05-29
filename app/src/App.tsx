import React from 'react';
import { Stations } from './components/stations/stations';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { SubGroups } from './components/sub_groups/sub_groups';
// import { Account_group } from './components/account_groups/account_groups';
import { Groups } from './components/groups/groups';
import Sidebar from './components/sidebar/sidebar';
import { Ledger } from './components/ledger form/ledger_form';

export const App = () => {
  return (
    <React.StrictMode>
      <HashRouter>
        <Routes>  
          <Route path='/' element={<Sidebar />} />
          <Route path='/groups' element={<Groups />} />
          <Route path='/subgroups' element={<SubGroups />} />
          <Route path='/ledger' element={<Ledger />} />
          <Route path='/stations' element={<Stations />} />
          {/* <Route path='/' element={<Account_group />} /> */}
        </Routes>
      </HashRouter>
    </React.StrictMode>
  );
};  