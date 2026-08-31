import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { Prisma } from '@prisma/client';

// GET /api/store/domains?tenantId=...
export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenantId');
  if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 });

  const domains = await prisma.tenantCustomDomain.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(domains);
}

// POST /api/store/domains — add a custom domain
export async function POST(req: NextRequest) {
  const { tenantId, domain } = await req.json();
  if (!tenantId || !domain) {
    return NextResponse.json({ error: 'tenantId and domain are required' }, { status: 400 });
  }

  // Basic domain format validation
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/.test(domain)) {
    return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
  }

  try {
    const existing = await prisma.tenantCustomDomain.count({ where: { tenantId } });
    const record = await prisma.tenantCustomDomain.create({
      data: { tenantId, domain, isPrimary: existing === 0 },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'This domain is already in use' }, { status: 409 });
    }
    throw err;
  }
}
