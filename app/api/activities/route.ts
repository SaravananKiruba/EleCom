import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tenantId = searchParams.get('tenantId');
  if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 });

  const where: Record<string, unknown> = { tenantId };
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
  const body = await req.json();
  const { tenantId, userId, type, subject, description, customerId, quoteId, rfqId, salesOrderId } = body;
  if (!tenantId || !userId || !type) return NextResponse.json({ error: 'tenantId, userId, type required' }, { status: 400 });

  const activity = await prisma.activity.create({
    data: { tenantId, userId, type, subject, description, customerId, quoteId, rfqId, salesOrderId },
    include: { user: { select: { name: true } } },
  });
  return NextResponse.json(activity, { status: 201 });
}
