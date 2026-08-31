import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { vercelRemoveDomain, vercelGetDomain } from '@/src/server/vercelApi';

// PATCH /api/store/domains/[id] — re-check DNS verification status with Vercel
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const record = await prisma.tenantCustomDomain.findUnique({ where: { id } });
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });

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

// DELETE /api/store/domains/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const record = await prisma.tenantCustomDomain.findUnique({ where: { id } });
  if (!record) return NextResponse.json({ ok: true });

  // Remove from Vercel before deleting from DB
  if (process.env.VERCEL_API_TOKEN && process.env.VERCEL_PROJECT_ID) {
    await vercelRemoveDomain(record.domain);
  }

  await prisma.tenantCustomDomain.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
