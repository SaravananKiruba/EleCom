/**
 * Tenant scoping helpers for CRMBoo.
 * IMPORTANT: This is UI-layer isolation for demo purposes only.
 * Real tenant authorization MUST be enforced server-side and never trusted to the browser.
 */

import { Customer, RFQ, Quote, FollowUp, PurchaseOrder, Architect, Product } from '@/types';

export function scopeByTenant<T extends { tenantId: string }>(items: T[], tenantId: string): T[] {
  return items.filter(item => item.tenantId === tenantId);
}

export function getTenantCustomers(customers: Customer[], tenantId: string): Customer[] {
  return scopeByTenant(customers, tenantId);
}

export function getTenantRFQs(rfqs: RFQ[], tenantId: string): RFQ[] {
  return scopeByTenant(rfqs, tenantId);
}

export function getTenantQuotes(quotes: Quote[], tenantId: string): Quote[] {
  return scopeByTenant(quotes, tenantId);
}

export function getTenantOrders(orders: PurchaseOrder[], tenantId: string): PurchaseOrder[] {
  return scopeByTenant(orders, tenantId);
}

export function getTenantFollowUps(followUps: FollowUp[], tenantId: string): FollowUp[] {
  return scopeByTenant(followUps, tenantId);
}

export function getTenantArchitects(architects: Architect[], tenantId: string): Architect[] {
  return scopeByTenant(architects, tenantId);
}

export function getTenantProducts(products: Product[], tenantId: string): Product[] {
  return scopeByTenant(products, tenantId);
}

/** Get all data belonging to a customer within a tenant */
export function getCustomerRFQs(rfqs: RFQ[], customerId: string): RFQ[] {
  return rfqs.filter(r => r.customerId === customerId);
}

export function getCustomerQuotes(quotes: Quote[], customerId: string): Quote[] {
  return quotes.filter(q => q.customerId === customerId);
}

export function getCustomerOrders(orders: PurchaseOrder[], customerId: string): PurchaseOrder[] {
  return orders.filter(o => o.customerId === customerId);
}
