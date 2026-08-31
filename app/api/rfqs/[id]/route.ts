import { NextRequest, NextResponse } from 'next/server';
import { getRFQById, updateRFQStatus } from '@/src/server/services/rfqService';
import { requireTenant, isResponse } from '@/src/server/auth';
import { RFQStatus } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  const { id } = await params;
  try {
    const rfq = await getRFQById(auth.tenantId!, id);
    if (auth.role === 'CUSTOMER' && auth.customerId && rfq.customerId !== auth.customerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(rfq);
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
  try {
    const rfq = await updateRFQStatus(auth.tenantId!, id, body.status as RFQStatus, auth.id);
    return NextResponse.json(rfq);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: msg }, { status: 422 });
  }
}
