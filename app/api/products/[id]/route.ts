import { NextRequest, NextResponse } from 'next/server';
import { updateProduct, deleteProduct } from '@/src/server/services/productService';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { tenantId, ...data } = body;
  if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
  try {
    const product = await updateProduct(tenantId, id, data);
    return NextResponse.json(product);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 422 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tenantId = req.nextUrl.searchParams.get('tenantId');
  if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
  try {
    await deleteProduct(tenantId, id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 422 });
  }
}
