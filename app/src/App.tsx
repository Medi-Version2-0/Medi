import React from 'react';
// import { Stations } from './components/stations/stations';
import { HashRouter, Route, Routes } from 'react-router-dom';
// import { SubGroups } from './components/sub_groups/sub_groups';
import { Account_group } from './components/account_groups/account_groups';
// import { Groups } from './components/groups/groups';

export const App = () => {
  return (
    <React.StrictMode>
      <HashRouter>
        <Routes>  
          {/* <Route path='/' element={<Stations />} /> */}
          <Route path='/' element={<Account_group />} />
          {/* <Route path='/' element={<Groups />} /> */}
          {/* <Route path='/' element={<SubGroups />} /> */}
        </Routes>
      </HashRouter>
    </React.StrictMode>
  );
};