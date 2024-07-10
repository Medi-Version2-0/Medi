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
import { Sales_Purchase_Table } from './components/sales_purchase/sales_purchase_table';
import { Store } from './views/Stores';
import { Company } from './views/company';
import { CreateCompany } from './views/company/CreateCompany';
import CreateItem from './views/item/create-item';
import { AuthForm } from './components/AuthForm';
import { NotAuthorized } from './views/NotAuthrozed';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthRoute } from './components/AuthRoute';
import RedirectToCompany from './components/RedirectToCompany';
import Items from './views/item';
import { ItemGroups } from './views/itemGroups';

export const App = () => {
  return (
    <React.StrictMode>  
      <HashRouter>
        <Routes>
          <Route path='/login' element={<AuthForm isLogin={true} />} />
          <Route path='/register' element={<AuthForm isLogin={false} />} />

          <Route element={<AuthRoute />}>
            <Route path='/redirecttocompany' element={<RedirectToCompany />} />
            <Route path='/' element={<Home />}>
              <Route path='/:companyId/*' element={<AppRoot />} />
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
  const { companyId } = useParams();
  const { user, setSelectedOrganization } = useUser();
  useEffect(() => {
    if (companyId) {
      setSelectedOrganization(+companyId);
    } else if (user) {
      const defaultCompanyId = user.UserOrganizations[0]?.organizationId;
      if (defaultCompanyId) {
        setSelectedOrganization(defaultCompanyId);
      }
    }
  }, [companyId, user, setSelectedOrganization]);

  return (
    <Routes>
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
            element={<Sales_Purchase_Table type="Sales" />}
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
      {/* <Route
        path='/items/:itemId/batch'
        element={
          <ProtectedRoute element={<Batch />} requiredPermissions={['admin']} />
        }
      /> */}
    </Routes>
  );
};
