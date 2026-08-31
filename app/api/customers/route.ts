import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, createCustomer } from '@/src/server/services/customerService';

// GET /api/customers?tenantId=...&status=...&search=...
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const tenantId = searchParams.get('tenantId');
  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
  }

  const result = await getCustomers(tenantId, {
    status: searchParams.get('status') as never ?? undefined,
    search: searchParams.get('search') ?? undefined,
    skip: Number(searchParams.get('skip') ?? 0),
    take: Number(searchParams.get('take') ?? 50),
  });

  return NextResponse.json(result);
}

// POST /api/customers
export async function POST(req: NextRequest) {
  const body = await req.json();
  const customer = await createCustomer(body);
  return NextResponse.json(customer, { status: 201 });
}
