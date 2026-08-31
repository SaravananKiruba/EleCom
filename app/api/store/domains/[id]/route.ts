import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';

// DELETE /api/store/domains/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.tenantCustomDomain.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
