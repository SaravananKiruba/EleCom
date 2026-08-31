import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { requireTenant, isResponse } from '@/src/server/auth';
import { assertTenantOwnership } from '@/src/server/tenantContext';
import { ArchitectStatus, Prisma } from '@prisma/client';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN' && auth.role !== 'SALES') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.architect.findUnique({ where: { id } });
  assertTenantOwnership(existing, auth.tenantId!, 'Architect');

  const data: Prisma.ArchitectUpdateInput = {};
  if (body.status) data.status = body.status as ArchitectStatus;
  if (body.notes !== undefined) data.notes = body.notes;

  if (body.discount !== undefined) {
    const prev = existing.currentDiscount ? Number(existing.currentDiscount) : 0;
    const next = Number(body.discount);
    data.currentDiscount = new Prisma.Decimal(next);
    await prisma.architectDiscountHistory.create({
      data: {
        architectId: id,
        previousDiscount: new Prisma.Decimal(prev),
        newDiscount: new Prisma.Decimal(next),
        reason: body.discountReason,
        effectiveFrom: body.discountEffectiveFrom ? new Date(body.discountEffectiveFrom) : new Date(),
        createdById: auth.id,
      },
    });
  }

  const updated = await prisma.architect.update({ where: { id }, data });
  return NextResponse.json(updated);
}
