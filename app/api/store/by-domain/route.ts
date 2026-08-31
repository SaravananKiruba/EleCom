import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';

// GET /api/store/by-domain?domain=[host] — used by middleware
export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get('domain');
  if (!domain) return NextResponse.json({ error: 'domain required' }, { status: 400 });

  const record = await prisma.tenantCustomDomain.findUnique({
    where: { domain },
    include: { tenant: { select: { id: true, slug: true, name: true, status: true } } },
  });

  if (!record || record.tenant.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
  }

  return NextResponse.json({ tenantSlug: record.tenant.slug, tenantId: record.tenant.id });
}
