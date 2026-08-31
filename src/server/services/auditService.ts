import { prisma } from '@/src/server/prisma';
import { AuditAction } from '@prisma/client';

interface AuditParams {
  tenantId?: string;
  userId?: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  oldValues?: object;
  newValues?: object;
  ipAddress?: string;
  userAgent?: string;
}

/** Appends an audit record. Never throws — audit failure must not break business logic. */
export async function audit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        entityType: params.entityType,
        entityId: params.entityId,
        action: params.action,
        oldValues: params.oldValues ?? undefined,
        newValues: params.newValues ?? undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch {
    // Audit failures are non-fatal — log to console but do not propagate
    console.error('[audit] Failed to write audit log', params);
  }
}
