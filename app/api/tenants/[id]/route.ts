import { NextRequest, NextResponse } from 'next/server';
import { approveTenant, suspendTenant, getTenantById, deleteTenantCascade } from '@/src/server/services/tenantService';
import { requireRole, isResponse } from '@/src/server/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireRole(req, ['SAAS_ADMIN']);
  if (isResponse(auth)) return auth;
  const { id } = await params;
  const tenant = await getTenantById(id);
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(tenant);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireRole(req, ['SAAS_ADMIN']);
  if (isResponse(auth)) return auth;
  const { id } = await params;
  const body = await req.json();
  const { action, reason } = body;

  if (action === 'approve') {
    const tenant = await approveTenant(id, auth.id);
    return NextResponse.json(tenant);
  }
  if (action === 'suspend') {
    const tenant = await suspendTenant(id, auth.id, reason);
    return NextResponse.json(tenant);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

// DELETE /api/tenants/[id] — permanently removes tenant and all associated data
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireRole(req, ['SAAS_ADMIN']);
  if (isResponse(auth)) return auth;
  const { id } = await params;

  const confirm = req.nextUrl.searchParams.get('confirm');
  const tenant = await getTenantById(id);
  if (!tenant) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (confirm !== tenant.slug) {
    return NextResponse.json({ error: 'Confirmation mismatch — pass ?confirm=<tenant-slug>' }, { status: 400 });
  }

  try {
    await deleteTenantCascade(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Delete failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
