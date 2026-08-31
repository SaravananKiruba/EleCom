import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { tenantId, status } = await req.json();
  if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.tenantId !== tenantId) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const updated = await prisma.user.update({ where: { id }, data: { status } });
  return NextResponse.json({ id: updated.id, status: updated.status });
}
