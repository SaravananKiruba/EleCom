import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';

// GET /api/store/[tenantSlug]/products/[slug] — public product detail scoped to tenant
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string; slug: string }> },
) {
  const { tenantSlug, slug } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant || tenant.status !== 'ACTIVE' || tenant.deletedAt) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  const product = await prisma.product.findFirst({
    where: { tenantId: tenant.id, slug, isActive: true, deletedAt: null, status: 'ACTIVE' },
    include: {
      brand: true,
      category: true,
      specifications: { orderBy: { sortOrder: 'asc' } },
      variants: { where: { isActive: true } },
      documents: true,
    },
  });

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}
