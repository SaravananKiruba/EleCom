import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status');

  const subscriptions = await prisma.subscription.findMany({
    where: status ? { status: status as never } : undefined,
    include: {
      tenant: { select: { id: true, name: true, email: true } },
      plan: { select: { name: true, price: true, billingInterval: true } },
    },
    orderBy: { createdAt: 'desc' },
    skip: Number(searchParams.get('skip') ?? 0),
    take: Number(searchParams.get('take') ?? 50),
  });

  const total = await prisma.subscription.count({ where: status ? { status: status as never } : undefined });
  return NextResponse.json({ subscriptions, total });
}
