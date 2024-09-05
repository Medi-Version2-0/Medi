// src/UserContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  Dispatch,
  SetStateAction,
} from 'react';
import { mediAccessToken } from './auth';

export interface User {
  id: number;
  name?:string;
  city?:string;
  address?:string;  
  email: string;
  permissions: string[];
  organizationId : number;
  UserOrganizations: {
    organizationId: number;
    Organization: {
      id: number;
      name: string;
    };
  }[];
}

interface UserContextType {
  user: User | null;
  register: (
    email: string,
    password: string,
    permissions: string[],
    organizationIds: number[]
  ) => void;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  setUser: Dispatch<SetStateAction<any>>;
  selectedCompany: number | undefined;
  setSelectedOrganization: Dispatch<SetStateAction<number | undefined>>;
}

const apiUrl = process.env.REACT_APP_API_URL;

const UserContext = createContext<UserContextType | undefined>(undefined);

export const USER_LS_KEY = 'authenticatedUser';

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedCompany, setSelectedOrganization] = useState<number | undefined>(1);
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem(USER_LS_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_LS_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_LS_KEY);
    }
    if(user?.organizationId){
      setSelectedOrganization(user.organizationId)
    }
  }, [user]);

  const register = async (
    email: string,
    password: string,
    permissions: string[],
    organizationIds: number[]
  ) => {
    try {
      await fetch(apiUrl + '/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'admin',
          email,
          password,
          permissions,
          organizationIds,
        }),
      });
      window.location.replace('/login');
    } catch (error) {
      const e = error as Error;
      throw new Error(e.message);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const fetchRequest = await fetch(apiUrl + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      }).then((x) => x.json());

      if (fetchRequest.error === false) {
        const parsedUser = {
          ...fetchRequest.data,
        };
        localStorage.setItem(mediAccessToken, fetchRequest.access_token);
        localStorage.setItem('password', password);
        setUser(parsedUser);
        return parsedUser;
      }
    } catch (error) {
      const e = error as Error;
      throw new Error(e.message);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        register,
        login,
        logout,
        setUser,
        selectedCompany,
        setSelectedOrganization,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
