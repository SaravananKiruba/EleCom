import { NextRequest, NextResponse } from 'next/server';
import { getSalesOrderById, updateSalesOrderStatus } from '@/src/server/services/salesOrderService';
import { requireTenant, isResponse } from '@/src/server/auth';
import { SalesOrderStatus } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  const { id } = await params;
  try {
    const so = await getSalesOrderById(auth.tenantId!, id);
    return NextResponse.json(so);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN' && auth.role !== 'SALES') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  const status = body.status as SalesOrderStatus;
  const extra = {
    trackingId: body.trackingId,
    dispatchDate: body.dispatchDate ? new Date(body.dispatchDate) : undefined,
    deliveredAt: body.deliveredAt ? new Date(body.deliveredAt) : undefined,
  };
  try {
    const so = await updateSalesOrderStatus(auth.tenantId!, id, status, extra, auth.id);
    return NextResponse.json(so);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: msg }, { status: 422 });
  }
}
