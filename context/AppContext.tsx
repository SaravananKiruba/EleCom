'use client';

import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { QuoteCartItem } from '@/types';

interface CartState {
  cartItems: QuoteCartItem[];
}

type Action =
  | { type: 'ADD_TO_CART'; payload: QuoteCartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QTY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'HYDRATE'; payload: CartState };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'ADD_TO_CART': {
      const existing = state.cartItems.find(i => i.productId === action.payload.productId);
      if (existing) {
        return {
          cartItems: state.cartItems.map(i =>
            i.productId === action.payload.productId
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i,
          ),
        };
      }
      return { cartItems: [...state.cartItems, action.payload] };
    }
    case 'REMOVE_FROM_CART':
      return { cartItems: state.cartItems.filter(i => i.productId !== action.payload) };
    case 'UPDATE_CART_QTY':
      return {
        cartItems: state.cartItems.map(i =>
          i.productId === action.payload.productId ? { ...i, quantity: action.payload.quantity } : i,
        ),
      };
    case 'CLEAR_CART':
      return { cartItems: [] };
    default:
      return state;
  }
}

const initialState: CartState = { cartItems: [] };
const STORAGE_KEY = 'crmboo:cart';

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
