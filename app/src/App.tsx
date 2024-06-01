import React from 'react';
import { Stations } from './components/stations/stations';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { SubGroups } from './components/sub_groups/sub_groups';
// import { Account_group } from './components/account_groups/account_groups';
import { Groups } from './components/groups/groups';
import Sidebar from './components/sidebar/sidebar';
import { Ledger } from './components/ledger form/ledger_form';
import { Ledger_Table } from './components/ledger form/ledger_table';
import { Headquarters } from './components/headquarters/headquarters';

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
          <Route path='/headquarters' element={<Headquarters />} />
          <Route path='/ledger_table' element={<Ledger_Table />} />
        </Routes>
      </HashRouter>
    </React.StrictMode>
  );
};  