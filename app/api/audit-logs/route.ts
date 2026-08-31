import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tenantId = searchParams.get('tenantId');
  if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 });

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
