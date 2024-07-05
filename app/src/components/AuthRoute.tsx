import React from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';

export const AuthRoute = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  <Navigate to={`/${user?.UserOrganizations[1]?.organizationId}`} />;

  return <Outlet />;
};
