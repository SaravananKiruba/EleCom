import { prisma } from '@/src/server/prisma';
import { tenantScope, assertTenantOwnership } from '@/src/server/tenantContext';
import { audit } from './auditService';
import { nextDocumentNumber } from './sequenceService';
import { SalesOrderStatus, QuoteStatus, Prisma } from '@prisma/client';

export interface CreateSalesOrderInput {
  tenantId: string;
  customerId: string;
  quoteId?: string;
  customerPoNumber?: string;
  notes?: string;
  termsAndConditions?: string;
  dueDate?: Date;
  billingAddressSnapshot?: string;
  shippingAddressSnapshot?: string;
  customerNameSnapshot?: string;
  createdById?: string;
  items: {
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
  }[];
}

/** Converts an accepted quote into a Sales Order atomically. */
export async function convertQuoteToSalesOrder(
  tenantId: string,
  quoteId: string,
  extra: {
    customerPoNumber?: string;
    dueDate?: Date;
    billingAddressSnapshot?: string;
    shippingAddressSnapshot?: string;
    createdById?: string;
  },
) {
  return prisma.$transaction(async (tx) => {
    const quote = await tx.quote.findUnique({
      where: { id: quoteId },
      include: { items: true, customer: true, salesOrder: true },
    });

    if (!quote || quote.tenantId !== tenantId) {
      throw new Error('Quote not found or access denied');
    }
    if (quote.status !== QuoteStatus.ACCEPTED) {
      throw new Error('Only accepted quotes can be converted to a Sales Order');
    }
    if (quote.salesOrder !== null) {
      throw new Error('Quote has already been converted to a Sales Order');
    }

    const year = new Date().getFullYear();
    // Generate SO number inside the transaction using raw increment
    await tx.documentSequence.upsert({
      where: { tenantId_documentType_year: { tenantId, documentType: 'SALES_ORDER', year } },
      create: { tenantId, documentType: 'SALES_ORDER', year, nextNumber: 1 },
      update: {},
    });
    await tx.$executeRaw`
      UPDATE DocumentSequence
      SET nextNumber = nextNumber + 1
      WHERE tenantId = ${tenantId}
        AND documentType = 'SALES_ORDER'
        AND year = ${year}
    `;
    const seq = await tx.documentSequence.findUniqueOrThrow({
      where: { tenantId_documentType_year: { tenantId, documentType: 'SALES_ORDER', year } },
    });
    const soNumber = `SO-${year}-${String(seq.nextNumber - 1).padStart(6, '0')}`;

    const so = await tx.salesOrder.create({
      data: {
        tenantId,
        customerId: quote.customerId,
        quoteId,
        soNumber,
        customerPoNumber: extra.customerPoNumber,
        status: SalesOrderStatus.ACTIVE,
        currency: quote.currency,
        subtotal: quote.subtotal,
        discountAmount: quote.discountAmount,
        taxAmount: quote.taxAmount,
        deliveryCharges: quote.deliveryCharges,
        totalAmount: quote.totalAmount,
        customerNameSnapshot: extra.billingAddressSnapshot
          ? quote.customer.companyName
          : undefined,
        billingAddressSnapshot: extra.billingAddressSnapshot,
        shippingAddressSnapshot: extra.shippingAddressSnapshot,
        termsAndConditions: quote.termsAndConditions,
        dueDate: extra.dueDate,
        createdById: extra.createdById,
        items: {
          create: quote.items.map((item) => ({
            productId: item.productId,
            productVariantId: item.productVariantId,
            productNameSnapshot: item.productNameSnapshot,
            skuSnapshot: item.skuSnapshot,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            discountPercent: item.discountPercent,
            discountAmount: item.discountAmount,
            taxPercent: item.taxPercent,
            taxAmount: item.taxAmount,
            lineTotal: item.lineTotal,
          })),
        },
      },
      include: { items: true },
    });

    await tx.quote.update({
      where: { id: quoteId },
      data: { status: QuoteStatus.CONVERTED_TO_SO },
    });

    return so;
  });
}

export async function getSalesOrders(
  tenantId: string,
  options?: { status?: SalesOrderStatus; customerId?: string; skip?: number; take?: number },
) {
  const where: Prisma.SalesOrderWhereInput = {
    ...tenantScope(tenantId),
    ...(options?.status && { status: options.status }),
    ...(options?.customerId && { customerId: options.customerId }),
  };

  const [salesOrders, total] = await Promise.all([
    prisma.salesOrder.findMany({
      where,
      include: { customer: true, items: true },
      orderBy: { createdAt: 'desc' },
      skip: options?.skip,
      take: options?.take,
    }),
    prisma.salesOrder.count({ where }),
  ]);

  return { salesOrders, total };
}

export async function getSalesOrderById(tenantId: string, soId: string) {
  const so = await prisma.salesOrder.findUnique({
    where: { id: soId },
    include: {
      customer: true,
      quote: true,
      items: { include: { product: true, productVariant: true } },
    },
  });
  assertTenantOwnership(so, tenantId, 'SalesOrder');
  return so;
}

export async function updateSalesOrderStatus(
  tenantId: string,
  soId: string,
  status: SalesOrderStatus,
  extra?: { trackingId?: string; dispatchDate?: Date; deliveredAt?: Date },
  updatedById?: string,
) {
  const existing = await prisma.salesOrder.findUnique({ where: { id: soId } });
  assertTenantOwnership(existing, tenantId, 'SalesOrder');

  const updated = await prisma.salesOrder.update({
    where: { id: soId },
    data: {
      status,
      ...(extra?.trackingId && { trackingId: extra.trackingId }),
      ...(extra?.dispatchDate && { dispatchDate: extra.dispatchDate }),
      ...(extra?.deliveredAt && { deliveredAt: extra.deliveredAt }),
    },
  });

  await audit({
    tenantId,
    userId: updatedById,
    entityType: 'SalesOrder',
    entityId: soId,
    action: 'STATUS_CHANGE',
    oldValues: { status: existing.status },
    newValues: { status },
  });

  return updated;
}
