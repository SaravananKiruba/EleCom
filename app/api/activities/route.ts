import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { requireTenant, isResponse } from '@/src/server/auth';

export async function GET(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;

  const { searchParams } = req.nextUrl;
  const where: Record<string, unknown> = { tenantId: auth.tenantId! };
  if (searchParams.get('customerId')) where.customerId = searchParams.get('customerId');
  if (searchParams.get('quoteId')) where.quoteId = searchParams.get('quoteId');
  if (searchParams.get('rfqId')) where.rfqId = searchParams.get('rfqId');

  const activities = await prisma.activity.findMany({
    where,
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json(activities);
}

export async function POST(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  const body = await req.json();
  const { type, subject, description, customerId, quoteId, rfqId, salesOrderId } = body;
  if (!type) return NextResponse.json({ error: 'type required' }, { status: 400 });

  const activity = await prisma.activity.create({
    data: {
      tenantId: auth.tenantId!,
      userId: auth.id,
      type, subject, description, customerId, quoteId, rfqId, salesOrderId,
    },
    include: { user: { select: { name: true } } },
  });
  return NextResponse.json(activity, { status: 201 });
}
