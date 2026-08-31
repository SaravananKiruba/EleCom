import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { requireTenant, isResponse } from '@/src/server/auth';
import { ArchitectStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN' && auth.role !== 'SALES') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status') as ArchitectStatus | null;
  const architects = await prisma.architect.findMany({
    where: {
      tenantId: auth.tenantId!,
      deletedAt: null,
      ...(status && { status }),
    },
    include: { discountHistory: { orderBy: { createdAt: 'desc' }, take: 20 } },
    orderBy: { createdAt: 'desc' },
    skip: Number(searchParams.get('skip') ?? 0),
    take: Number(searchParams.get('take') ?? 100),
  });
  return NextResponse.json(architects);
}
