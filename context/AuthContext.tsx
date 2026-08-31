'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Mirrors Prisma UserRole enum
export type UserRole = 'SAAS_ADMIN' | 'TENANT_ADMIN' | 'SALES' | 'CUSTOMER' | 'ARCHITECT' | 'guest';

export interface AuthUser {
  id?: string;
  role: UserRole;
  name: string;
  email?: string;
  tenantId?: string;
  tenantName?: string;
  tenantSlug?: string;
  customerId?: string;
  architectId?: string;
}

interface AuthContextType {
  user: AuthUser;
  login: (user: AuthUser) => void;
  logout: () => void;
  isAdmin: boolean;
  isArchitect: boolean;
  isCustomer: boolean;
  isSaasAdmin: boolean;
}

const GUEST: AuthUser = { role: 'guest', name: 'Guest' };
const AUTH_KEY = 'crmboo_auth';

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
      isAdmin: user.role === 'TENANT_ADMIN' || user.role === 'SALES',
      isArchitect: user.role === 'ARCHITECT',
      isCustomer: user.role === 'CUSTOMER',
      isSaasAdmin: user.role === 'SAAS_ADMIN',
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
