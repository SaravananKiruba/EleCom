import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { resolvePublicTenant } from '@/src/server/resolveTenant';

export async function GET(req: NextRequest) {
  const tenant = await resolvePublicTenant(req);
  if (!tenant) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ where: { tenantId: tenant.id, isActive: true }, orderBy: { name: 'asc' } }),
    prisma.category.findMany({ where: { tenantId: tenant.id, isActive: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
  ]);

  return NextResponse.json({ brands, categories });
}
