import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../UserContext';

export const AuthRoute = () => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to='/login' />;
  }

  <Navigate to={`/${user?.UserOrganizations[1]?.organizationId}`} />;

  return <Outlet />;
};
