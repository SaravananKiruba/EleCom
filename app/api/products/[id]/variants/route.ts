import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { requireTenant, isResponse } from '@/src/server/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
  if (!product || product.tenantId !== auth.tenantId) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product.variants);
}

// POST /api/products/[id]/variants — replace all variants
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN' && auth.role !== 'SALES') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  const { variants } = await req.json();

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.tenantId !== auth.tenantId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.productVariant.deleteMany({ where: { productId: id } });
  const created = await prisma.productVariant.createMany({
    data: (variants as Array<{ sku: string; name: string; price?: number; stockQuantity?: number }>).map(v => ({
      productId: id,
      sku: v.sku,
      name: v.name,
      price: v.price ?? null,
      stockQuantity: v.stockQuantity ?? null,
      isActive: true,
    })),
  });
  return NextResponse.json({ count: created.count });
}
