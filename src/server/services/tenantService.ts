import { prisma } from '@/src/server/prisma';
import { tenantScope } from '@/src/server/tenantContext';
import { TenantStatus, Prisma } from '@prisma/client';
import { vercelRemoveDomain } from '@/src/server/vercelApi';

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

/**
 * Permanently delete a tenant and every record associated with it.
 * Deletion order matters — children must be removed before parents because
 * the schema has no ON DELETE CASCADE on tenant relations.
 */
export async function deleteTenantCascade(tenantId: string) {
  const scope = { tenantId };

  // Remove custom domains from Vercel first (external side-effect, done outside tx)
  const domains = await prisma.tenantCustomDomain.findMany({ where: scope });
  if (process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID) {
    for (const d of domains) {
      try { await vercelRemoveDomain(d.domain); } catch { /* best-effort */ }
    }
  }

  // Cascade delete inside a single transaction
  await prisma.$transaction(async (tx) => {
    // --- Leaf records first ---
    await tx.subscriptionEvent.deleteMany({ where: scope });
    await tx.followUp.deleteMany({ where: scope });

    // Line items reference their parent (SO / Quote / RFQ)
    await tx.salesOrderItem.deleteMany({ where: { salesOrder: { tenantId } } });
    await tx.quoteItem.deleteMany({ where: { quote: { tenantId } } });
    await tx.rFQItem.deleteMany({ where: { rfq: { tenantId } } });

    await tx.activity.deleteMany({ where: scope });
    await tx.auditLog.deleteMany({ where: scope });

    // Documents (SO → Quote → RFQ order matters due to FK references)
    await tx.salesOrder.deleteMany({ where: scope });
    await tx.quote.deleteMany({ where: scope });
    await tx.rFQ.deleteMany({ where: scope });

    await tx.architectDiscountHistory.deleteMany({ where: { architect: { tenantId } } });
    await tx.architect.deleteMany({ where: scope });

    // Products cascade to spec/variant/document via schema
    await tx.product.deleteMany({ where: scope });
    await tx.category.deleteMany({ where: scope });
    await tx.brand.deleteMany({ where: scope });

    // Customer cascades to contacts/addresses via schema
    await tx.customer.deleteMany({ where: scope });

    await tx.subscription.deleteMany({ where: scope });
    await tx.tenantSetting.deleteMany({ where: scope });
    await tx.documentSequence.deleteMany({ where: scope });
    await tx.tenantCustomDomain.deleteMany({ where: scope });

    // Users last (many entities reference them)
    await tx.user.deleteMany({ where: scope });

    // Finally the tenant itself
    await tx.tenant.delete({ where: { id: tenantId } });
  }, { timeout: 30000 });

  return { ok: true };
}
