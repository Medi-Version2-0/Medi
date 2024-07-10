import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';

export const AuthRoute = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  <Navigate to={`/${user?.UserOrganizations[1]?.organizationId}`} />;

  return <Outlet />;
};
