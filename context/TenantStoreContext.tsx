'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TenantStore {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  logoUrl: string | null;
  primaryColor: string;
  bannerText: string | null;
  primaryDomain: string | null;
}

const TenantStoreContext = createContext<TenantStore | null>(null);

export function TenantStoreProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const [store, setStore] = useState<TenantStore | null>(null);

  useEffect(() => {
    fetch(`/api/store/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setStore(data); });
  }, [slug]);

  return (
    <TenantStoreContext.Provider value={store}>
      {children}
    </TenantStoreContext.Provider>
  );
}

export function useTenantStore() {
  return useContext(TenantStoreContext);
}
