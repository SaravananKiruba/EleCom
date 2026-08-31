import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';

// GET /api/store/[tenantSlug]/products
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const { tenantSlug } = await params;
  const { searchParams } = req.nextUrl;

  const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } });
  if (!tenant || tenant.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  const search = searchParams.get('q') ?? undefined;
  const categoryId = searchParams.get('category') ?? undefined;
  const brandId = searchParams.get('brand') ?? undefined;
  const skip = Number(searchParams.get('skip') ?? 0);
  const take = Number(searchParams.get('take') ?? 12);

  const where = {
    tenantId: tenant.id,
    isActive: true,
    deletedAt: null,
    status: 'ACTIVE' as const,
    ...(categoryId && { categoryId }),
    ...(brandId && { brandId }),
    ...(search && { OR: [{ name: { contains: search } }, { sku: { contains: search } }] }),
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
