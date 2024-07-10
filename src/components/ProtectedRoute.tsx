import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from './../UserContext';

interface ProtectedRouteProps {
  element: React.ReactElement;
  requiredPermissions: string[];
}

export const ProtectedRoute = ({
  element,
  requiredPermissions,
}: ProtectedRouteProps) => {
  const { user } = useUser();

  if (!user) {
    return <Navigate to='login' />;
  }

  const hasPermission = requiredPermissions.every((perm) =>
    user.permissions.includes(perm)
  );

  return hasPermission ? element : <Navigate to='/not-authorized' />;
};
