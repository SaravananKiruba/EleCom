import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, createCustomer } from '@/src/server/services/customerService';
import { requireTenant, isResponse } from '@/src/server/auth';

export async function GET(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN' && auth.role !== 'SALES') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const result = await getCustomers(auth.tenantId!, {
    status: searchParams.get('status') as never ?? undefined,
    search: searchParams.get('search') ?? undefined,
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
  const customer = await createCustomer({ ...body, tenantId: auth.tenantId!, createdById: auth.id });
  return NextResponse.json(customer, { status: 201 });
}
