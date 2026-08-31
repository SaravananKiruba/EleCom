'use client';

import React, { createContext, useContext, useEffect, useMemo, useReducer, ReactNode } from 'react';
import { QuoteCartItem } from '@/types';

interface CartState {
  // Cart items keyed by tenant slug — each tenant portal keeps its own isolated cart.
  cartsByTenant: Record<string, QuoteCartItem[]>;
}

type Action =
  | { type: 'ADD_TO_CART'; payload: { tenantSlug: string; item: QuoteCartItem } }
  | { type: 'REMOVE_FROM_CART'; payload: { tenantSlug: string; productId: string } }
  | { type: 'UPDATE_CART_QTY'; payload: { tenantSlug: string; productId: string; quantity: number } }
  | { type: 'CLEAR_CART'; payload: { tenantSlug: string } }
  | { type: 'HYDRATE'; payload: CartState };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'ADD_TO_CART': {
      const { tenantSlug, item } = action.payload;
      const current = state.cartsByTenant[tenantSlug] ?? [];
      const existing = current.find(i => i.productId === item.productId);
      const next = existing
        ? current.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i)
        : [...current, item];
      return { cartsByTenant: { ...state.cartsByTenant, [tenantSlug]: next } };
    }
    case 'REMOVE_FROM_CART': {
      const { tenantSlug, productId } = action.payload;
      const current = state.cartsByTenant[tenantSlug] ?? [];
      return { cartsByTenant: { ...state.cartsByTenant, [tenantSlug]: current.filter(i => i.productId !== productId) } };
    }
    case 'UPDATE_CART_QTY': {
      const { tenantSlug, productId, quantity } = action.payload;
      const current = state.cartsByTenant[tenantSlug] ?? [];
      return {
        cartsByTenant: {
          ...state.cartsByTenant,
          [tenantSlug]: current.map(i => i.productId === productId ? { ...i, quantity } : i),
        },
      };
    }
    case 'CLEAR_CART': {
      const { tenantSlug } = action.payload;
      const { [tenantSlug]: _removed, ...rest } = state.cartsByTenant;
      return { cartsByTenant: rest };
    }
    default:
      return state;
  }
}

const initialState: CartState = { cartsByTenant: {} };
const STORAGE_KEY = 'crmboo:cart:v2';

const AppContext = createContext<{ state: CartState; dispatch: React.Dispatch<Action> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) as CartState });
    } catch {
      // Ignore corrupted cart — a stale localStorage entry should not break the app.
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch {
      // Ignore quota/serialization errors.
    }
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

// Tenant-scoped cart hook — the ONLY way customer pages should touch the cart.
export function useTenantCart(tenantSlug: string) {
  const { state, dispatch } = useAppState();
  const items = state.cartsByTenant[tenantSlug] ?? [];
  return useMemo(() => ({
    items,
    count: items.reduce((s, i) => s + i.quantity, 0),
    add: (item: QuoteCartItem) => dispatch({ type: 'ADD_TO_CART', payload: { tenantSlug, item } }),
    remove: (productId: string) => dispatch({ type: 'REMOVE_FROM_CART', payload: { tenantSlug, productId } }),
    updateQty: (productId: string, quantity: number) =>
      dispatch({ type: 'UPDATE_CART_QTY', payload: { tenantSlug, productId, quantity } }),
    clear: () => dispatch({ type: 'CLEAR_CART', payload: { tenantSlug } }),
  }), [items, tenantSlug, dispatch]);
}
