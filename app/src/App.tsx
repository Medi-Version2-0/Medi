import React from 'react';
import { Stations } from './views/stations';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Groups } from "./views/groups";
import { SubGroups } from './views/subgroups';
import { Ledger } from './components/ledger form/ledger_form';
import { Ledger_Table } from './components/ledger form/ledger_table';
import { Headquarters } from './views/headquarters';
import Home from './views/home';
import { Sales_Purchase } from './components/sales_purchase/sales_purchase';
import { Sales_Purchase_Table } from './components/sales_purchase/sales_purchase_table';

export const App = () => {
  return (
    <React.StrictMode>
      <HashRouter>
        <Routes>
          <Route path='/' element={<Home />}>
            <Route path='/stations' element={<Stations />} />
            <Route path='/groups' element={<Groups />} />
            <Route path='/subgroups' element={<SubGroups />} />
            <Route path='/ledger' element={<Ledger />} />
            <Route path='/headquarters' element={<Headquarters />} />
            <Route path='/ledger_table' element={<Ledger_Table />} />
            <Route path='/sales_purchase' element={<Sales_Purchase />} />
            <Route path='/sales_purchase_table' element={<Sales_Purchase_Table />} />
          </Route>
        </Routes>
      </HashRouter>
    </React.StrictMode>
  );
};