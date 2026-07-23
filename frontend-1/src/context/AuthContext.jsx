import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { loginRequest, probeRole, registerRequest } from '../services/authService';

const AuthContext = createContext(null);
const STORAGE_KEY = 'nimbus_auth';

function readStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth());
  const [authLoading, setAuthLoading] = useState(false);

  const persist = useCallback((data) => {
    if (data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setAuth(data);
  }, []);

  const login = useCallback(
    async (username, password) => {
      setAuthLoading(true);
      try {
        await loginRequest(username, password);
        const role = await probeRole(username, password);
        const sessionData = {
          username,
          password,
          user: {
            username,
            role
          }
        };
        persist(sessionData);
        return sessionData;
      } finally {
        setAuthLoading(false);
      }
    },
    [persist]
  );

  const register = useCallback(async (payload) => {
    setAuthLoading(true);
    try {
      return await registerRequest(payload);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    persist(null);
  }, [persist]);

  const value = useMemo(
    () => ({
      user: auth?.user || null,
      isAuthenticated: !!(auth?.username && auth?.password),
      isAdmin: auth?.user?.role === 'ADMIN',
      authLoading,
      login,
      register,
      logout
    }),
    [auth, authLoading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
