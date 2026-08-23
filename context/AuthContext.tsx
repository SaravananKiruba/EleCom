'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'guest' | 'customer' | 'architect' | 'admin';

export interface AuthUser {
  role: UserRole;
  name: string;
  email?: string;
  architectId?: string;
  discount?: number;
}

interface AuthContextType {
  user: AuthUser;
  login: (user: AuthUser) => void;
  logout: () => void;
  isAdmin: boolean;
  isArchitect: boolean;
  isCustomer: boolean;
}

const GUEST: AuthUser = { role: 'guest', name: 'Guest' };
const AUTH_KEY = 'elecom_auth';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(GUEST);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {}
  }, []);

  const login = (u: AuthUser) => {
    setUser(u);
    try { localStorage.setItem(AUTH_KEY, JSON.stringify(u)); } catch {}
  };

  const logout = () => {
    setUser(GUEST);
    try { localStorage.removeItem(AUTH_KEY); } catch {}
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAdmin: user.role === 'admin',
      isArchitect: user.role === 'architect',
      isCustomer: user.role === 'customer',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
