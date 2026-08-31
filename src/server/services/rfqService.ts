import { prisma } from '@/src/server/prisma';
import { tenantScope, assertTenantOwnership } from '@/src/server/tenantContext';
import { audit } from './auditService';
import { nextDocumentNumber } from './sequenceService';
import { RFQStatus, RFQSource, Prisma } from '@prisma/client';

export interface CreateRFQInput {
  tenantId: string;
  customerId: string;
  source?: RFQSource;
  subject?: string;
  notes?: string;
  requestedDate?: Date;
  createdById?: string;
  items: {
    productId?: string;
    productVariantId?: string;
    productNameSnapshot?: string;
    skuSnapshot?: string;
    description?: string;
    quantity: number;
    unit?: string;
    customerNotes?: string;
  }[];
}

export async function createRFQ(input: CreateRFQInput) {
  const year = new Date().getFullYear();
  const rfqNumber = await nextDocumentNumber(input.tenantId, 'RFQ', year);

  const rfq = await prisma.rFQ.create({
    data: {
      tenantId: input.tenantId,
      customerId: input.customerId,
      rfqNumber,
      source: input.source ?? RFQSource.MANUAL,
      subject: input.subject,
      notes: input.notes,
      requestedDate: input.requestedDate,
      createdById: input.createdById,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          productVariantId: item.productVariantId,
          productNameSnapshot: item.productNameSnapshot,
          skuSnapshot: item.skuSnapshot,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          customerNotes: item.customerNotes,
        })),
      },
    },
    include: { items: true },
  });

  await audit({
    tenantId: input.tenantId,
    userId: input.createdById,
    entityType: 'RFQ',
    entityId: rfq.id,
    action: 'CREATE',
    newValues: { rfqNumber, customerId: input.customerId },
  });

  return rfq;
}

export async function getRFQs(
  tenantId: string,
  options?: { status?: RFQStatus; customerId?: string; skip?: number; take?: number },
) {
  const where: Prisma.RFQWhereInput = {
    ...tenantScope(tenantId),
    ...(options?.status && { status: options.status }),
    ...(options?.customerId && { customerId: options.customerId }),
  };

  const [rfqs, total] = await Promise.all([
    prisma.rFQ.findMany({
      where,
      include: { customer: true, items: true },
      orderBy: { createdAt: 'desc' },
      skip: options?.skip,
      take: options?.take,
    }),
    prisma.rFQ.count({ where }),
  ]);

  return { rfqs, total };
}

export async function getRFQById(tenantId: string, rfqId: string) {
  const rfq = await prisma.rFQ.findUnique({
    where: { id: rfqId },
    include: { customer: true, items: { include: { product: true, productVariant: true } } },
  });
  assertTenantOwnership(rfq, tenantId, 'RFQ');
  return rfq;
}

export async function updateRFQStatus(
  tenantId: string,
  rfqId: string,
  status: RFQStatus,
  updatedById?: string,
) {
  const existing = await prisma.rFQ.findUnique({ where: { id: rfqId } });
  assertTenantOwnership(existing, tenantId, 'RFQ');

  const updated = await prisma.rFQ.update({ where: { id: rfqId }, data: { status } });

  await audit({
    tenantId,
    userId: updatedById,
    entityType: 'RFQ',
    entityId: rfqId,
    action: 'STATUS_CHANGE',
    oldValues: { status: existing.status },
    newValues: { status },
  });

  return updated;
}
