/**
 * Wraps every tenant-owned query with a tenantId guard.
 * Use: prisma.customer.findMany({ where: { ...tenantScope(tenantId), status: 'ACTIVE' } })
 */
export function tenantScope(tenantId: string) {
  return { tenantId };
}

/** Ensures a record belongs to the given tenant — throws if it doesn't. */
export function assertTenantOwnership(
  record: { tenantId: string } | null,
  tenantId: string,
  entity: string,
): asserts record is NonNullable<typeof record> {
  if (!record || record.tenantId !== tenantId) {
    throw new Error(`${entity} not found or access denied`);
  }
}
