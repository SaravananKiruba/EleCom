import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/src/server/services/productService';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tenantId = searchParams.get('tenantId');
  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
  }

  const result = await getProducts(tenantId, {
    categoryId: searchParams.get('categoryId') ?? undefined,
    brandId: searchParams.get('brandId') ?? undefined,
    status: searchParams.get('status') as never ?? undefined,
    search: searchParams.get('search') ?? undefined,
    skip: Number(searchParams.get('skip') ?? 0),
    take: Number(searchParams.get('take') ?? 50),
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tenantId, ...data } = body;
  if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
  try {
    const product = await createProduct(tenantId, data);
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 422 });
  }
}
