import { NextRequest, NextResponse } from 'next/server';
import { getCategories } from '@/src/server/services/productService';

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenantId');
  if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
  const categories = await getCategories(tenantId);
  return NextResponse.json(categories);
}
