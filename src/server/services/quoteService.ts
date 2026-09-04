import { prisma } from '@/src/server/prisma';
import { tenantScope, assertTenantOwnership } from '@/src/server/tenantContext';
import { audit } from './auditService';
import { nextDocumentNumber } from './sequenceService';
import { QuoteStatus, Prisma } from '@prisma/client';

export interface QuoteItemInput {
  productId?: string;
  productVariantId?: string;
  productNameSnapshot?: string;
  skuSnapshot?: string;
  description?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  discountPercent?: number;
  taxPercent?: number;
}

export interface CreateQuoteInput {
  tenantId: string;
  rfqId?: string;
  customerId: string;
  validUntil?: Date;
  notes?: string;
  termsAndConditions?: string;
  deliveryCharges?: number;
  createdById?: string;
  items: QuoteItemInput[];
}

function calcLineTotals(items: QuoteItemInput[]) {
  let subtotal = 0;
  let discountAmount = 0;
  let taxAmount = 0;

  const computed = items.map((item) => {
    const gross = item.quantity * item.unitPrice;
    const disc = (gross * (item.discountPercent ?? 0)) / 100;
    const net = gross - disc;
    const tax = (net * (item.taxPercent ?? 0)) / 100;
    const lineTotal = net + tax;

    subtotal += gross;
    discountAmount += disc;
    taxAmount += tax;

    return { ...item, discountAmount: disc, taxAmount: tax, lineTotal };
  });

  return { computed, subtotal, discountAmount, taxAmount };
}

export async function createQuote(input: CreateQuoteInput) {
  const year = new Date().getFullYear();
  const quoteNumber = await nextDocumentNumber(input.tenantId, 'QUOTE', year);

  const { computed, subtotal, discountAmount, taxAmount } = calcLineTotals(input.items);
  const totalAmount = subtotal - discountAmount + taxAmount + (input.deliveryCharges ?? 0);

  const quote = await prisma.quote.create({
    data: {
      tenantId: input.tenantId,
      rfqId: input.rfqId,
      customerId: input.customerId,
      quoteNumber,
      status: QuoteStatus.DRAFT,   // admin reviews before sharing
      validUntil: input.validUntil,
      currency: 'INR',
      subtotal: new Prisma.Decimal(subtotal),
      discountAmount: new Prisma.Decimal(discountAmount),
      taxAmount: new Prisma.Decimal(taxAmount),
      deliveryCharges: new Prisma.Decimal(input.deliveryCharges ?? 0),
      totalAmount: new Prisma.Decimal(totalAmount),
      notes: input.notes,
      termsAndConditions: input.termsAndConditions,
      createdById: input.createdById,
      items: {
        create: computed.map((item) => ({
          productId: item.productId,
          productVariantId: item.productVariantId,
          productNameSnapshot: item.productNameSnapshot,
          skuSnapshot: item.skuSnapshot,
          description: item.description,
          quantity: new Prisma.Decimal(item.quantity),
          unit: item.unit,
          unitPrice: new Prisma.Decimal(item.unitPrice),
          discountPercent: new Prisma.Decimal(item.discountPercent ?? 0),
          discountAmount: new Prisma.Decimal(item.discountAmount),
          taxPercent: new Prisma.Decimal(item.taxPercent ?? 0),
          taxAmount: new Prisma.Decimal(item.taxAmount),
          lineTotal: new Prisma.Decimal(item.lineTotal),
        })),
      },
    },
    include: { items: true },
  });

  if (input.rfqId) {
    await prisma.rFQ.update({
      where: { id: input.rfqId },
      data: { status: 'QUOTE_READY' },
    });
  }

  await audit({
    tenantId: input.tenantId,
    userId: input.createdById,
    entityType: 'Quote',
    entityId: quote.id,
    action: 'CREATE',
    newValues: { quoteNumber, totalAmount },
  });

  return quote;
}

export async function getQuotes(
  tenantId: string,
  options?: { status?: QuoteStatus; customerId?: string; skip?: number; take?: number },
) {
  const where: Prisma.QuoteWhereInput = {
    ...tenantScope(tenantId),
    ...(options?.status && { status: options.status }),
    ...(options?.customerId && { customerId: options.customerId }),
  };

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      include: { customer: true, items: true, rfq: true },
      orderBy: { createdAt: 'desc' },
      skip: options?.skip,
      take: options?.take,
    }),
    prisma.quote.count({ where }),
  ]);

  return { quotes, total };
}

export async function getQuoteById(tenantId: string, quoteId: string) {
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: {
      customer: true,
      rfq: true,
      items: { include: { product: true, productVariant: true } },
      followUps: true,
    },
  });
  assertTenantOwnership(quote, tenantId, 'Quote');
  return quote;
}

export async function updateQuoteStatus(
  tenantId: string,
  quoteId: string,
  status: QuoteStatus,
  updatedById?: string,
  extra?: { rejectionReason?: string },
) {
  const existing = await prisma.quote.findUnique({ where: { id: quoteId } });
  assertTenantOwnership(existing, tenantId, 'Quote');

  const data: Prisma.QuoteUpdateInput = {
    status,
    ...(status === QuoteStatus.ACCEPTED && { acceptedAt: new Date() }),
    ...(status === QuoteStatus.REJECTED && {
      rejectedAt: new Date(),
      rejectionReason: extra?.rejectionReason,
    }),
  };

  const updated = await prisma.quote.update({ where: { id: quoteId }, data });

  await audit({
    tenantId,
    userId: updatedById,
    entityType: 'Quote',
    entityId: quoteId,
    action: 'STATUS_CHANGE',
    oldValues: { status: existing.status },
    newValues: { status },
  });

  return updated;
}
