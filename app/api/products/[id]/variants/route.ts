import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';

// GET /api/products/[id]/variants?tenantId=
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenantId = req.nextUrl.searchParams.get('tenantId');
  if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
  const product = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
  if (!product || product.tenantId !== tenantId) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(product.variants);
}

// POST /api/products/[id]/variants — create or update variants in bulk
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { tenantId, variants } = await req.json();
  if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.tenantId !== tenantId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Replace all variants
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
