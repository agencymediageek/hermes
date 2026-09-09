'use client';
import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import api from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'developer' | 'viewer';
  initials: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

const TOKEN_KEY = 'hermes_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
  }, []);

  // Restore session on mount
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      api.fetch<{ user: User }>('/api/auth/me', { token: saved })
        .then(({ user: u }) => { setUser(u); setToken(saved); })
        .catch(() => localStorage.removeItem(TOKEN_KEY))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.fetch<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem(TOKEN_KEY, res.token);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
