import { NextRequest, NextResponse } from 'next/server';
import { getCategories, upsertCategory } from '@/src/server/services/productService';
import { requireTenant, isResponse } from '@/src/server/auth';

export async function GET(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  const categories = await getCategories(auth.tenantId!);
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const { tenantId, name, parentId } = await req.json();
  if (!tenantId || !name?.trim()) {
    return NextResponse.json({ error: 'tenantId and name required' }, { status: 400 });
  }
  const category = await upsertCategory(tenantId, name.trim(), parentId ?? null);
  return NextResponse.json(category);
}
