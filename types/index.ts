// UI-facing types aligned to Prisma enum string values (UPPER_SNAKE_CASE).
// Use `formatEnum(status)` from '@/utils/format' to display them.

export type TenantStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'SUSPENDED' | 'REJECTED' | 'CANCELLED';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  legalName?: string;
  email: string;
  phone?: string;
  gstNumber?: string;
  industry?: string;
  status: TenantStatus;
  createdAt: string;
}

export type UserRole = 'SAAS_ADMIN' | 'TENANT_ADMIN' | 'SALES' | 'CUSTOMER' | 'ARCHITECT';
export type MembershipRole = 'TENANT_ADMIN' | 'SALES' | 'CUSTOMER' | 'ARCHITECT';

export interface UserRecord {
  id: string;
  membershipId?: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  discountPercent?: number | null;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

export interface ProductSpec {
  specKey: string;
  specValue: string;
  unit?: string | null;
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price?: string | number | null;
  stockQuantity?: number | null;
}

export interface Product {
  id: string;
  tenantId: string;
  sku: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  basePrice?: string | number | null;
  currency?: string;
  imageUrl?: string | null;
  isFeatured?: boolean;
  brand?: Brand | null;
  category?: Category | null;
  specifications?: ProductSpec[];
  variants?: ProductVariant[];
}

export type RFQStatus =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'QUOTE_READY'
  | 'FOLLOW_UP'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export type RFQSource = 'WEBSITE' | 'MANUAL' | 'PHONE' | 'EMAIL' | 'WHATSAPP' | 'OTHER';

export interface RFQItem {
  id?: string;
  productId?: string | null;
  productVariantId?: string | null;
  productNameSnapshot?: string | null;
  skuSnapshot?: string | null;
  description?: string | null;
  quantity: number | string;
  unit?: string | null;
  customerNotes?: string | null;
  product?: Product | null;
}

export interface RFQ {
  id: string;
  tenantId: string;
  rfqNumber: string;
  customerId: string;
  status: RFQStatus;
  source: RFQSource;
  subject?: string | null;
  notes?: string | null;
  requestedDate?: string | null;
  createdAt: string;
  customer?: { id: string; companyName: string; contactPerson?: string | null; email?: string | null; phone?: string | null };
  items?: RFQItem[];
}

export type QuoteStatus =
  | 'DRAFT'
  | 'SHARED'
  | 'FOLLOW_UP'
  | 'NEGOTIATION'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'CONVERTED_TO_SO';

export interface QuoteItem {
  id?: string;
  productId?: string | null;
  productVariantId?: string | null;
  productNameSnapshot?: string | null;
  skuSnapshot?: string | null;
  description?: string | null;
  quantity: number | string;
  unit?: string | null;
  unitPrice: number | string;
  discountPercent?: number | string;
  discountAmount?: number | string;
  taxPercent?: number | string;
  taxAmount?: number | string;
  lineTotal: number | string;
  product?: Product | null;
}

export interface Quote {
  id: string;
  tenantId: string;
  quoteNumber: string;
  quoteToken?: string | null;
  version?: number;
  rfqId?: string | null;
  customerId: string;
  architectId?: string | null;
  status: QuoteStatus;
  validUntil?: string | null;
  currency?: string;
  subtotal: number | string;
  discountAmount: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
  deliveryCharges: number | string;
  notes?: string | null;
  termsAndConditions?: string | null;
  sharedAt?: string | null;
  acceptedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  customer?: { id: string; companyName: string; contactPerson?: string | null };
  rfq?: { id: string; rfqNumber: string } | null;
  items?: QuoteItem[];
}

export type FollowUpMethod = 'PHONE' | 'EMAIL' | 'WHATSAPP' | 'MEETING' | 'OTHER';
export type FollowUpStatus = 'OPEN' | 'COMPLETED' | 'CANCELLED';

export interface FollowUp {
  id: string;
  tenantId: string;
  quoteId: string;
  customerId: string;
  assignedToId?: string | null;
  method: FollowUpMethod;
  subject?: string | null;
  notes?: string | null;
  lastContactAt?: string | null;
  nextFollowUpAt?: string | null;
  status: FollowUpStatus;
  createdAt: string;
  customer?: { id: string; companyName: string; contactPerson?: string | null };
  quote?: { id: string; quoteNumber: string };
  assignedTo?: { id: string; name: string } | null;
}

export type SalesOrderStatus = 'ACTIVE' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';

export interface SalesOrderItem {
  id?: string;
  productId?: string | null;
  productVariantId?: string | null;
  productNameSnapshot?: string | null;
  skuSnapshot?: string | null;
  description?: string | null;
  quantity: number | string;
  unit?: string | null;
  unitPrice: number | string;
  discountPercent?: number | string;
  discountAmount?: number | string;
  taxPercent?: number | string;
  taxAmount?: number | string;
  lineTotal: number | string;
  product?: Product | null;
}

export interface SalesOrder {
  id: string;
  tenantId: string;
  soNumber: string;
  customerId: string;
  quoteId?: string | null;
  customerPoNumber?: string | null;
  status: SalesOrderStatus;
  subtotal: number | string;
  discountAmount: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
  deliveryCharges: number | string;
  customerNameSnapshot?: string | null;
  billingAddressSnapshot?: string | null;
  shippingAddressSnapshot?: string | null;
  notes?: string | null;
  termsAndConditions?: string | null;
  orderDate: string;
  dueDate?: string | null;
  dispatchDate?: string | null;
  deliveredAt?: string | null;
  trackingId?: string | null;
  createdAt: string;
  customer?: { id: string; companyName: string; contactPerson?: string | null };
  quote?: { id: string; quoteNumber: string } | null;
  items?: SalesOrderItem[];
}

export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface Customer {
  id: string;
  tenantId: string;
  customerCode: string;
  companyName: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;
  businessType?: string | null;
  status: CustomerStatus;
  notes?: string | null;
  createdAt: string;
}

export type ArchitectStatus = 'PROSPECT' | 'ACTIVE' | 'INACTIVE' | 'BLOCKED';

export interface DiscountHistory {
  id: string;
  architectId: string;
  previousDiscount: number | string;
  newDiscount: number | string;
  reason?: string | null;
  effectiveFrom: string;
  createdAt: string;
}

export interface Architect {
  id: string;
  tenantId: string;
  architectCode: string;
  firmName: string;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  licenseNumber?: string | null;
  city?: string | null;
  state?: string | null;
  status: ArchitectStatus;
  currentDiscount?: number | string | null;
  notes?: string | null;
  createdAt: string;
  discountHistory?: DiscountHistory[];
}

/** Client-side quote-cart entry. */
export interface QuoteCartItem {
  productId: string;
  quantity: number;
}

/** Line total helper for legacy UI code (server persists the authoritative value). */
export function computeQuoteItemTotal(li: { quantity: number | string; unitPrice: number | string; discountPercent?: number | string; taxPercent?: number | string }): number {
  const qty = Number(li.quantity);
  const price = Number(li.unitPrice);
  const disc = Number(li.discountPercent ?? 0);
  const tax = Number(li.taxPercent ?? 0);
  const gross = qty * price;
  const net = gross * (1 - disc / 100);
  return net * (1 + tax / 100);
}
