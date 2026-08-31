'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  loading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isArchitect: boolean;
  isCustomer: boolean;
  isSaasAdmin: boolean;
}

const GUEST: AuthUser = { role: 'guest', name: 'Guest' };

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser>(GUEST);
  const [loading, setLoading] = useState(true);

  // Hydrate from JWT cookie on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.user) setUser(d.user as AuthUser); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = (u: AuthUser) => setUser(u);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(GUEST);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
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
