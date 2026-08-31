import { NextRequest, NextResponse } from 'next/server';
import { approveTenant, suspendTenant, getTenantById } from '@/src/server/services/tenantService';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const tenant = await getTenantById(id);
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(tenant);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();
  const { action, performedById, reason } = body;

  if (action === 'approve') {
    const tenant = await approveTenant(id, performedById);
    return NextResponse.json(tenant);
  }
  if (action === 'suspend') {
    const tenant = await suspendTenant(id, performedById, reason);
    return NextResponse.json(tenant);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
