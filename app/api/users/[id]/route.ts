import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { requireTenant, isResponse } from '@/src/server/auth';

// PATCH /api/users/[id] — update a team member's membership status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  const { status } = await req.json();

  const membership = await prisma.userTenantMembership.findFirst({
    where: { userId: id, tenantId: auth.tenantId! },
  });
  if (!membership) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.userTenantMembership.update({
    where: { id: membership.id },
    data: { status },
  });
  return NextResponse.json({ id, membershipId: updated.id, status: updated.status });
}
