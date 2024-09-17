import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useUser } from '../../UserContext';
import axios from 'axios';
import { APIURL } from '../../helper/api';

export const AuthRoute = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    async function validateUser() {
      try {
        const tokenValidationResponse = await axios.post(`${APIURL}/auth/validate-token`, {}, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
        if (tokenValidationResponse.data.success) {
          setUser(tokenValidationResponse.data.data);
        }
      } catch (error: any) {
        navigate('/login');
      }
    }
    if(!user) validateUser();
  }, []);

  if (!user) {
    navigate('/login');
    return null;
  }

  return <Outlet />;
};
