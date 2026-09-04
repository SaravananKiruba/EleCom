import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { requireTenant, isResponse } from '@/src/server/auth';
import { randomUUID } from 'crypto';

// POST /api/quotes/[id]/share
// Generates a quoteToken (if absent), sets status=SHARED, records sharedAt.
// Returns the shareable URL so the admin can copy it or open WhatsApp.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN' && auth.role !== 'SALES') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  const quote = await prisma.quote.findFirst({
    where: { id, tenantId: auth.tenantId! },
    include: { tenant: { select: { slug: true } } },
  });
  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

  if (quote.status === 'CONVERTED_TO_SO' || quote.status === 'EXPIRED') {
    return NextResponse.json({ error: `Cannot share a quote in status ${quote.status}` }, { status: 422 });
  }

  const token = quote.quoteToken ?? randomUUID();
  const updated = await prisma.quote.update({
    where: { id },
    data: {
      status: 'SHARED',
      quoteToken: token,
      sharedAt: quote.sharedAt ?? new Date(),
    },
  });

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'crmboo.io';
  const shareUrl = `https://${quote.tenant.slug}.${rootDomain}/store/${quote.tenant.slug}/quotation/${id}?token=${token}`;

  return NextResponse.json({ quoteToken: token, shareUrl, status: updated.status });
}
