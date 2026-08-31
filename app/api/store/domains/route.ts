import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { Prisma } from '@prisma/client';
import { vercelAddDomain } from '@/src/server/vercelApi';
import { requireAuth, isResponse } from '@/src/server/auth';

// Tenant admins can manage their own domains; SaaS admins can manage any.
function scopeTenantId(role: string, authTenantId: string | undefined, requested?: string | null): string | null {
  if (role === 'SAAS_ADMIN') return requested ?? null;
  if ((role === 'TENANT_ADMIN' || role === 'SALES') && authTenantId) return authTenantId;
  return null;
}

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (isResponse(auth)) return auth;

  const requested = req.nextUrl.searchParams.get('tenantId');
  const tenantId = scopeTenantId(auth.role, auth.tenantId, requested);
  if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 });

  const domains = await prisma.tenantCustomDomain.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(domains);
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (isResponse(auth)) return auth;
  const { tenantId: requested, domain } = await req.json();
  const tenantId = scopeTenantId(auth.role, auth.tenantId, requested);
  if (!tenantId || !domain) {
    return NextResponse.json({ error: 'tenantId and domain are required' }, { status: 400 });
  }
  if (auth.role !== 'SAAS_ADMIN' && auth.role !== 'TENANT_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/.test(domain)) {
    return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 });
  }

  try {
    const existing = await prisma.tenantCustomDomain.count({ where: { tenantId } });

    let vercelDomainId: string | undefined;
    if (process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID) {
      const result = await vercelAddDomain(domain);
      vercelDomainId = result.uid;
    }

    const record = await prisma.tenantCustomDomain.create({
      data: {
        tenantId,
        domain,
        isPrimary: existing === 0,
        domainStatus: 'pending_dns',
        vercelDomainId: vercelDomainId ?? null,
      },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'This domain is already in use' }, { status: 409 });
    }
    throw err;
  }
}
