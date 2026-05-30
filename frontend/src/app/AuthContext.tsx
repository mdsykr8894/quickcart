import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User } from '../types';
import { authApi } from '../services/authApi';
import { api } from '../services/api';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (payload: any) => Promise<User | null>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Checks and loads active user profile if HttpOnly cookie session is active
  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await authApi.getMe();
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      // Discard errors on boot check (shopper is a guest)
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Perform cookie login session creation
  const login = async (payload: any): Promise<User | null> => {
    try {
      const res = await authApi.login(payload);
      if (res.success && res.data?.user) {
        setUser(res.data.user);
        return res.data.user;
      }
      return null;
    } catch (err) {
      setUser(null);
      throw err;
    }
  };

  // Perform new account registration
  const register = async (payload: any) => {
    try {
      const res = await authApi.register(payload);
      if (res.success && res.data) {
        // Log in automatically after registration, or simply complete it
        // Depending on backend design, let's login if login endpoint is resolved, 
        // or trigger custom login step in UI. We will let UI decide, but here we just store the user if returned
        setUser(res.data);
      }
    } catch (err) {
      setUser(null);
      throw err;
    }
  };

  // Terminate active cookie session
  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Network issue during logout:', err);
    } finally {
      setUser(null);
    }
  };

  // Auto boot-check session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const csrfData = await authApi.getCsrf();
        api.defaults.headers.common['X-CSRF-Token'] = csrfData.csrfToken;
      } catch (err) {
        console.warn('Failed to fetch CSRF token:', err);
      } finally {
        refreshUser();
      }
    };
    initAuth();
  }, [refreshUser]);

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
