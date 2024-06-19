import React from 'react';
import { Stations } from './views/stations';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Groups } from "./views/groups";
import { SubGroups } from './views/subgroups';
import { CreateLedger } from './views/ledger/CreateLedger';
import { Ledger } from './views/ledger';
import { Headquarters } from './views/headquarters';
import Home from './views/home';
import { Sales_Purchase_Table } from './components/sales_purchase/sales_purchase_table';
import { Store } from './views/Stores';
import { Company } from './views/company';
import { CreateCompany } from './views/company/CreateCompany';

export const App = () => {
  return (
    <React.StrictMode>
      <HashRouter>
        <Routes>
          <Route path='/' element={<Home />}>
            <Route path='/stations' element={<Stations />} />
            <Route path='/groups' element={<Groups />} />
            <Route path='/subgroups' element={<SubGroups />} />
            <Route path='/ledger' element={<CreateLedger />} />
            <Route path='/headquarters' element={<Headquarters />} />
            <Route path='/ledger_table' element={<Ledger />} />
            <Route path='/sales_purchase_table' element={<Sales_Purchase_Table />} />
            <Route path='/store' element={<Store />} />
            <Route path='/company_table' element={<Company />} />
            <Route path='/company' element={<CreateCompany />} />
          </Route>
        </Routes>
      </HashRouter>
    </React.StrictMode>
  );
};