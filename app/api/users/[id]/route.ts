import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { requireTenant, isResponse } from '@/src/server/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  const { status } = await req.json();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.tenantId !== auth.tenantId) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = await prisma.user.update({ where: { id }, data: { status } });
  return NextResponse.json({ id: updated.id, status: updated.status });
}
