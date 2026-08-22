export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  country: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  brandId: string;
  categoryId: string;
  subcategoryId: string;
  description: string;
  shortSpec: string;
  specifications: ProductSpec[];
  features: string[];
  tags: string[];
  imageUrl: string;
  images: string[];
  isActive: boolean;
  variants: string[];
  documents: { label: string; type: string }[];
}

export type RFQStatus =
  | 'New'
  | 'Under Review'
  | 'Quote Ready'
  | 'Follow-Up'
  | 'Accepted'
  | 'Rejected'
  | 'Expired';

export interface RFQItem {
  productId: string;
  quantity: number;
}

export interface RFQ {
  id: string;
  rfqNumber: string;
  customerId: string;
  customerName: string;
  companyName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  projectName: string;
  deliveryLocation: string;
  requiredDeliveryDate: string;
  additionalRequirements: string;
  remarks: string;
  items: RFQItem[];
  status: RFQStatus;
  createdAt: string;
  assignedTo?: string;
  timeline: TimelineEntry[];
}

export interface TimelineEntry {
  date: string;
  action: string;
  by: string;
  note?: string;
}

export type QuoteStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'Shared'
  | 'Follow-Up'
  | 'Negotiation'
  | 'Accepted'
  | 'Rejected'
  | 'Expired'
  | 'Converted to PO';

export interface QuoteLineItem {
  productId: string;
  quantity: number;
  basePrice: number;
  discount: number;
  tax: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  rfqId: string;
  rfqNumber: string;
  customerId: string;
  customerName: string;
  companyName: string;
  projectName: string;
  lineItems: QuoteLineItem[];
  deliveryCharges: number;
  terms: string;
  validUntil: string;
  status: QuoteStatus;
  createdAt: string;
  approvedAt?: string;
  sharedAt?: string;
  assignedTo?: string;
  rejectionReason?: string;
  lostReason?: string;
  lostRemarks?: string;
}

export type FollowUpMethod = 'WhatsApp' | 'Phone' | 'Email' | 'Meeting' | 'Other';
export type FollowUpStatus = 'Scheduled' | 'Completed' | 'Overdue' | 'Cancelled';

export interface FollowUp {
  id: string;
  quoteId: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  contactPerson: string;
  method: FollowUpMethod;
  lastContact: string;
  nextFollowUp: string;
  status: FollowUpStatus;
  assignedTo: string;
  notes: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  quoteId: string;
  quoteNumber: string;
  rfqNumber: string;
  customerId: string;
  customerName: string;
  companyName: string;
  billingAddress: string;
  deliveryAddress: string;
  lineItems: QuoteLineItem[];
  deliveryCharges: number;
  terms: string;
  poDate: string;
  status: 'Active' | 'Delivered' | 'Cancelled';
}

export type CustomerStatus = 'Active' | 'Inactive';

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  gst: string;
  status: CustomerStatus;
  createdAt: string;
}

export type ArchitectStatus = 'Pending' | 'Approved' | 'Rejected' | 'Suspended' | 'Active';

export interface Architect {
  id: string;
  name: string;
  firmName: string;
  mobile: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  licenseNumber: string;
  gst: string;
  website: string;
  specialization: string;
  status: ArchitectStatus;
  discount?: number;
  discountExpiry?: string;
  discountEffective?: string;
  discountHistory: DiscountHistory[];
  createdAt: string;
}

export interface DiscountHistory {
  previous: number;
  next: number;
  changedBy: string;
  date: string;
}

export interface QuoteCartItem {
  productId: string;
  quantity: number;
}
