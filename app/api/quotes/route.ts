import { NextRequest, NextResponse } from 'next/server';
import { getQuotes, createQuote } from '@/src/server/services/quoteService';
import { requireTenant, isResponse } from '@/src/server/auth';

export async function GET(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;

  const { searchParams } = req.nextUrl;
  // Customers only ever see their own quotes.
  const customerId = auth.role === 'CUSTOMER'
    ? (auth.customerId ?? '__none__')
    : (searchParams.get('customerId') ?? undefined);

  const result = await getQuotes(auth.tenantId!, {
    status: searchParams.get('status') as never ?? undefined,
    customerId,
    skip: Number(searchParams.get('skip') ?? 0),
    take: Number(searchParams.get('take') ?? 50),
  });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN' && auth.role !== 'SALES') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const quote = await createQuote({ ...body, tenantId: auth.tenantId!, createdById: body.createdById ?? auth.id });
  return NextResponse.json(quote, { status: 201 });
}
