import { NextRequest, NextResponse } from 'next/server';
import { getQuotes, createQuote } from '@/src/server/services/quoteService';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tenantId = searchParams.get('tenantId');
  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
  }

  const result = await getQuotes(tenantId, {
    status: searchParams.get('status') as never ?? undefined,
    customerId: searchParams.get('customerId') ?? undefined,
    skip: Number(searchParams.get('skip') ?? 0),
    take: Number(searchParams.get('take') ?? 50),
  });

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const quote = await createQuote(body);
  return NextResponse.json(quote, { status: 201 });
}
