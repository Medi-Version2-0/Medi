import React, { useEffect } from 'react';
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from 'react-router-dom';
import { useUser } from './UserContext';
import Home from './views/home';
import { Stations } from './views/stations';
import { Groups } from './views/groups';
import { SubGroups } from './views/subgroups';
import { CreateLedger } from './views/ledger/CreateLedger';
import { Ledger } from './views/ledger';
import { Headquarters } from './views/headquarters';
import { Store } from './views/Stores';
import { Company } from './views/company';
import { CreateCompany } from './views/company/CreateCompany';
import CreateItem from './views/item/create-item';
import { AuthForm } from './components/auth/AuthForm';
import { NotAuthorized } from './views/NotAuthrozed';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthRoute } from './components/auth/AuthRoute';
import RedirectToCompany from './components/RedirectToCompany';
import Items from './views/item';
import { ItemGroups } from './views/itemGroups';
import { Sales_Table } from './views/sales_purchase';
import { BillBook } from './views/BillBook';
import DeliveryChallan from './views/DeliveryChallan';
import { Organization } from './views/organization';
import InitialFirmSetup from './views/home/InitialFirmSetup';
import UserForm from './views/user/UserForm';
import SaleBill from './views/saleBill';

export const App = () => {
  return (
    <React.StrictMode>
      <HashRouter>
        <Routes>
          <Route path='/login' element={<AuthForm isLogin={true} />} />
          <Route path='/register' element={<AuthForm isLogin={false} />} />

          <Route element={<AuthRoute />}>
            <Route path='/redirecttocompany' element={<RedirectToCompany />} />
            <Route path='/user/setup' element={<UserForm />} />
            <Route path='/company/setup' element={<InitialFirmSetup />} />
            <Route path='/' element={<Home />}>
              <Route path='/:organizationId/*' element={<AppRoot />} />
            </Route>
          </Route>

          <Route path='/not-authorized' element={<NotAuthorized />} />
          <Route path='*' element={<Navigate to='/redirecttocompany' />} />
        </Routes>
      </HashRouter>
    </React.StrictMode>
  );
};

const AppRoot = () => {
  const { user, setSelectedOrganization, selectedCompany: organizationId } = useUser();

  return (
    <Routes>
      <Route path='/main' element={<Organization />} />
      <Route path='/stations' element={<Stations />} />
      <Route path='/groups' element={<Groups />} />
      <Route path='/subgroups' element={<SubGroups />} />
      <Route path='/ledger' element={<CreateLedger />} />
      <Route
        path='/ledgers/:id'
        element={
          <ProtectedRoute
            element={<CreateLedger />}
            requiredPermissions={['admin']}
          />
        }
      />
      <Route path='/ledger_table' element={<Ledger />} />
      <Route path='/itemGroup' element={<ItemGroups />} />
      <Route path='/headquarters' element={<Headquarters />} />
      <Route
        path='/sales_purchase_table'
        element={
          <ProtectedRoute
            element={<Sales_Table type="Sales" />}
            requiredPermissions={['admin']}
          />
        }
      />
      <Route path='/stores' element={<Store />} />
      <Route path='/company' element={<Company />} />
      <Route path='/company/new' element={<CreateCompany />} />
      <Route path='/company/:id/edit' element={<CreateCompany />} />
      <Route path='/items/new' element={<CreateItem />} />
      <Route path='/items/:id/edit' element={<CreateItem />} />
      <Route
        path='/items'
        element={
          <ProtectedRoute element={<Items />} requiredPermissions={['admin']} />
        }
      />
      <Route
        path='/billBook'
        element={
          <ProtectedRoute element={<BillBook />} requiredPermissions={['admin']} />
        }
      />
      <Route
        path='/deliveryChallan'
        element={
          <ProtectedRoute element={<DeliveryChallan />} requiredPermissions={['admin']} />
        }
      />
      <Route
        path='/saleBill'
        element={
          <ProtectedRoute element={<SaleBill />} requiredPermissions={['admin']} />
        }
      />
    </Routes>
  );
};
