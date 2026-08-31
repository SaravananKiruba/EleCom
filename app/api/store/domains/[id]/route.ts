import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { vercelRemoveDomain, vercelGetDomain } from '@/src/server/vercelApi';
import { requireAuth, isResponse } from '@/src/server/auth';

function canManage(role: string, authTenantId: string | undefined, recordTenantId: string): boolean {
  if (role === 'SAAS_ADMIN') return true;
  if (role === 'TENANT_ADMIN' && authTenantId === recordTenantId) return true;
  return false;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireAuth(req);
  if (isResponse(auth)) return auth;
  const { id } = await params;
  const record = await prisma.tenantCustomDomain.findUnique({ where: { id } });
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!canManage(auth.role, auth.tenantId, record.tenantId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!process.env.VERCEL_API_TOKEN || !process.env.VERCEL_PROJECT_ID) {
    return NextResponse.json({ error: 'Vercel not configured' }, { status: 503 });
  }

  const vercelData = await vercelGetDomain(record.domain);
  const isVerified = vercelData.verified === true;

  const updated = await prisma.tenantCustomDomain.update({
    where: { id },
    data: {
      domainStatus: isVerified ? 'verified' : 'pending_dns',
      verifiedAt: isVerified ? new Date() : null,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireAuth(req);
  if (isResponse(auth)) return auth;
  const { id } = await params;
  const record = await prisma.tenantCustomDomain.findUnique({ where: { id } });
  if (!record) return NextResponse.json({ ok: true });
  if (!canManage(auth.role, auth.tenantId, record.tenantId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID) {
    await vercelRemoveDomain(record.domain);
  }

  await prisma.tenantCustomDomain.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
