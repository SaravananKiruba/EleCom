'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { QuoteCartItem, RFQ, Quote, FollowUp, PurchaseOrder, Architect, Customer, Tenant } from '@/types';
import {
  rfqs as initialRFQs,
  quotes as initialQuotes,
  followUps as initialFollowUps,
  purchaseOrders as initialPOs,
  architects as initialArchitects,
  customers as initialCustomers,
  tenants as initialTenants,
} from '@/data/mockData';

interface AppState {
  cartItems: QuoteCartItem[];
  rfqs: RFQ[];
  quotes: Quote[];
  followUps: FollowUp[];
  purchaseOrders: PurchaseOrder[];
  architects: Architect[];
  customers: Customer[];
  tenants: Tenant[];
}

type Action =
  | { type: 'ADD_TO_CART'; payload: QuoteCartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_CART_QTY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_RFQ'; payload: RFQ }
  | { type: 'UPDATE_RFQ'; payload: RFQ }
  | { type: 'ADD_QUOTE'; payload: Quote }
  | { type: 'UPDATE_QUOTE'; payload: Quote }
  | { type: 'ADD_FOLLOW_UP'; payload: FollowUp }
  | { type: 'UPDATE_FOLLOW_UP'; payload: FollowUp }
  | { type: 'ADD_PO'; payload: PurchaseOrder }
  | { type: 'UPDATE_PO'; payload: PurchaseOrder }
  | { type: 'UPDATE_ARCHITECT'; payload: Architect }
  | { type: 'ADD_ARCHITECT'; payload: Architect }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: Customer }
  | { type: 'ADD_TENANT'; payload: Tenant }
  | { type: 'UPDATE_TENANT'; payload: Tenant }
  | { type: 'LOAD_STATE'; payload: AppState };

const STORAGE_KEY = 'crmboo_app_state';

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;
    case 'ADD_TO_CART': {
      const existing = state.cartItems.find(i => i.productId === action.payload.productId);
      if (existing) {
        return {
          ...state,
          cartItems: state.cartItems.map(i =>
            i.productId === action.payload.productId
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      }
      return { ...state, cartItems: [...state.cartItems, action.payload] };
    }
    case 'REMOVE_FROM_CART':
      return { ...state, cartItems: state.cartItems.filter(i => i.productId !== action.payload) };
    case 'UPDATE_CART_QTY':
      return {
        ...state,
        cartItems: state.cartItems.map(i =>
          i.productId === action.payload.productId ? { ...i, quantity: action.payload.quantity } : i
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cartItems: [] };
    case 'ADD_RFQ':
      return { ...state, rfqs: [action.payload, ...state.rfqs] };
    case 'UPDATE_RFQ':
      return { ...state, rfqs: state.rfqs.map(r => r.id === action.payload.id ? action.payload : r) };
    case 'ADD_QUOTE':
      return { ...state, quotes: [action.payload, ...state.quotes] };
    case 'UPDATE_QUOTE':
      return { ...state, quotes: state.quotes.map(q => q.id === action.payload.id ? action.payload : q) };
    case 'ADD_FOLLOW_UP':
      return { ...state, followUps: [action.payload, ...state.followUps] };
    case 'UPDATE_FOLLOW_UP':
      return { ...state, followUps: state.followUps.map(f => f.id === action.payload.id ? action.payload : f) };
    case 'ADD_PO':
      return { ...state, purchaseOrders: [action.payload, ...state.purchaseOrders] };
    case 'UPDATE_PO':
      return { ...state, purchaseOrders: state.purchaseOrders.map(p => p.id === action.payload.id ? action.payload : p) };
    case 'UPDATE_ARCHITECT':
      return { ...state, architects: state.architects.map(a => a.id === action.payload.id ? action.payload : a) };
    case 'ADD_ARCHITECT':
      return { ...state, architects: [action.payload, ...state.architects] };
    case 'ADD_CUSTOMER':
      return { ...state, customers: [action.payload, ...state.customers] };
    case 'UPDATE_CUSTOMER':
      return { ...state, customers: state.customers.map(c => c.id === action.payload.id ? action.payload : c) };
    case 'ADD_TENANT':
      return { ...state, tenants: [action.payload, ...state.tenants] };
    case 'UPDATE_TENANT':
      return { ...state, tenants: state.tenants.map(t => t.id === action.payload.id ? action.payload : t) };
    default:
      return state;
  }
}

const initialState: AppState = {
  cartItems: [],
  rfqs: initialRFQs,
  quotes: initialQuotes,
  followUps: initialFollowUps,
  purchaseOrders: initialPOs,
  architects: initialArchitects,
  customers: initialCustomers,
  tenants: initialTenants,
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        dispatch({ type: 'LOAD_STATE', payload: JSON.parse(saved) });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
