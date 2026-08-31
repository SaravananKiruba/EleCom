import { prisma } from '@/src/server/prisma';
import { tenantScope } from '@/src/server/tenantContext';
import { TenantStatus, Prisma } from '@prisma/client';

export async function getTenants(options?: { status?: TenantStatus; skip?: number; take?: number }) {
  const where: Prisma.TenantWhereInput = {
    deletedAt: null,
    ...(options?.status && { status: options.status }),
  };

  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: options?.skip,
      take: options?.take,
    }),
    prisma.tenant.count({ where }),
  ]);

  return { tenants, total };
}

export async function getTenantById(tenantId: string) {
  return prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { subscriptions: { include: { plan: true } } },
  });
}

export async function approveTenant(tenantId: string, performedById?: string) {
  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: { status: TenantStatus.ACTIVE },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: performedById,
      entityType: 'Tenant',
      entityId: tenantId,
      action: 'STATUS_CHANGE',
      newValues: { status: TenantStatus.ACTIVE },
    },
  });

  return tenant;
}

export async function suspendTenant(tenantId: string, performedById?: string, reason?: string) {
  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: { status: TenantStatus.SUSPENDED },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: performedById,
      entityType: 'Tenant',
      entityId: tenantId,
      action: 'STATUS_CHANGE',
      newValues: { status: TenantStatus.SUSPENDED, reason },
    },
  });

  return tenant;
}

/** KPI summary for a single tenant — used on the admin dashboard. */
export async function getTenantKPIs(tenantId: string) {
  const [customers, rfqs, quotes, salesOrders] = await Promise.all([
    prisma.customer.count({ where: { ...tenantScope(tenantId), deletedAt: null } }),
    prisma.rFQ.count({ where: tenantScope(tenantId) }),
    prisma.quote.count({ where: tenantScope(tenantId) }),
    prisma.salesOrder.count({ where: tenantScope(tenantId) }),
  ]);

  return { customers, rfqs, quotes, salesOrders };
}
