import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, type User } from '../lib/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  // Validate stored token on mount
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    api.me()
      .then(setUser)
      .catch(() => { localStorage.removeItem('auth_token'); setToken(null); })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u, token: t } = await api.login(email, password);
    localStorage.setItem('auth_token', t);
    setToken(t);
    setUser(u);
  }, []);

  const register = useCallback(async (email: string, password: string, name?: string) => {
    const { user: u, token: t } = await api.register(email, password, name);
    localStorage.setItem('auth_token', t);
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
