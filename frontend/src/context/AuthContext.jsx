import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken, setToken } from '../utils/api.js';
import { authApi } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    authApi.me()
      .then(({ data }) => { if (!cancelled) setUser(data); })
      .catch(() => { if (!cancelled) setToken(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onLogout = () => logout();
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, [logout]);

  const loginSuccess = useCallback((userData) => {
    setUser(userData);
  }, []);

  const value = { user, loading, logout, loginSuccess };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
