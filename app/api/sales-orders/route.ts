import { NextRequest, NextResponse } from 'next/server';
import { getSalesOrders } from '@/src/server/services/salesOrderService';
import { requireTenant, isResponse } from '@/src/server/auth';

export async function GET(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;

  const { searchParams } = req.nextUrl;
  const customerId = auth.role === 'CUSTOMER'
    ? (auth.customerId ?? '__none__')
    : (searchParams.get('customerId') ?? undefined);

  const result = await getSalesOrders(auth.tenantId!, {
    status: searchParams.get('status') as never ?? undefined,
    customerId,
    skip: Number(searchParams.get('skip') ?? 0),
    take: Number(searchParams.get('take') ?? 50),
  });
  return NextResponse.json(result);
}
