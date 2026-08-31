import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';

// GET /api/store/[tenantSlug]/taxonomy — brands + categories for the storefront filters
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const { tenantSlug } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant || tenant.status !== 'ACTIVE' || tenant.deletedAt) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ where: { tenantId: tenant.id, isActive: true }, orderBy: { name: 'asc' } }),
    prisma.category.findMany({ where: { tenantId: tenant.id, isActive: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }),
  ]);

  return NextResponse.json({ brands, categories });
}
