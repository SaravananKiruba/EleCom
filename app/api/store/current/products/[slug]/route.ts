import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { resolvePublicTenant } from '@/src/server/resolveTenant';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const tenant = await resolvePublicTenant(req);
  if (!tenant) return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  const { slug } = await params;

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
