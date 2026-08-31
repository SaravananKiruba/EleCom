import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { requireTenant, isResponse } from '@/src/server/auth';

export async function GET(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const tenantId = auth.tenantId!;
  const logs = await prisma.auditLog.findMany({
    where: {
      tenantId,
      ...(searchParams.get('entityType') && { entityType: searchParams.get('entityType')! }),
    },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    skip: Number(searchParams.get('skip') ?? 0),
    take: Number(searchParams.get('take') ?? 50),
  });

  const total = await prisma.auditLog.count({ where: { tenantId } });
  return NextResponse.json({ logs, total });
}
