import { NextRequest, NextResponse } from 'next/server';
import { getRFQs, createRFQ } from '@/src/server/services/rfqService';
import { requireTenant, isResponse } from '@/src/server/auth';

export async function GET(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;

  const { searchParams } = req.nextUrl;
  const result = await getRFQs(auth.tenantId!, {
    status: searchParams.get('status') as never ?? undefined,
    customerId: searchParams.get('customerId') ?? undefined,
    skip: Number(searchParams.get('skip') ?? 0),
    take: Number(searchParams.get('take') ?? 50),
  });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;

  const body = await req.json();
  // Customers may only create RFQs against their own linked customer record.
  if (auth.role === 'CUSTOMER' && auth.customerId && body.customerId !== auth.customerId) {
    return NextResponse.json({ error: 'Customer scope mismatch' }, { status: 403 });
  }
  const rfq = await createRFQ({ ...body, tenantId: auth.tenantId!, createdById: body.createdById ?? auth.id });
  return NextResponse.json(rfq, { status: 201 });
}
