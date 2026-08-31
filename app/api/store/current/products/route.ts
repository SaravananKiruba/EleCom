import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { resolvePublicTenant } from '@/src/server/resolveTenant';

// GET /api/store/current/products — public catalogue for the tenant resolved from Host.
export async function GET(req: NextRequest) {
  const tenant = await resolvePublicTenant(req);
  if (!tenant) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const { searchParams } = req.nextUrl;
  const q = searchParams.get('q') ?? undefined;
  const categoryId = searchParams.get('category') ?? undefined;
  const brandId = searchParams.get('brand') ?? undefined;
  const skip = Number(searchParams.get('skip') ?? 0);
  const take = Number(searchParams.get('take') ?? 24);

  const where = {
    tenantId: tenant.id,
    isActive: true,
    deletedAt: null,
    status: 'ACTIVE' as const,
    ...(categoryId && { categoryId }),
    ...(brandId && { brandId }),
    ...(q && { OR: [{ name: { contains: q } }, { sku: { contains: q } }] }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
        specifications: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
      skip,
      take,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, tenantId: tenant.id });
}
