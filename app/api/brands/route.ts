import { NextRequest, NextResponse } from 'next/server';
import { getBrands, upsertBrand } from '@/src/server/services/productService';
import { requireTenant, isResponse } from '@/src/server/auth';

export async function GET(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  const brands = await getBrands(auth.tenantId!);
  return NextResponse.json(brands);
}

export async function POST(req: NextRequest) {
  const { tenantId, name } = await req.json();
  if (!tenantId || !name?.trim()) {
    return NextResponse.json({ error: 'tenantId and name required' }, { status: 400 });
  }
  const brand = await upsertBrand(tenantId, name.trim());
  return NextResponse.json(brand);
}
