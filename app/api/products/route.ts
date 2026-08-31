import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/src/server/services/productService';

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
