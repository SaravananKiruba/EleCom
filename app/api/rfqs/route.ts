import { NextRequest, NextResponse } from 'next/server';
import { getRFQs, createRFQ } from '@/src/server/services/rfqService';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tenantId = searchParams.get('tenantId');
  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
  }

  const result = await getRFQs(tenantId, {
    status: searchParams.get('status') as never ?? undefined,
    customerId: searchParams.get('customerId') ?? undefined,
    skip: Number(searchParams.get('skip') ?? 0),
    take: Number(searchParams.get('take') ?? 50),
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rfq = await createRFQ(body);
  return NextResponse.json(rfq, { status: 201 });
}
