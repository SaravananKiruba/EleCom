import { NextRequest, NextResponse } from 'next/server';
import { convertQuoteToSalesOrder } from '@/src/server/services/salesOrderService';
import { requireTenant, isResponse } from '@/src/server/auth';

// POST /api/sales-orders/convert — { quoteId, ...extra }
export async function POST(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN' && auth.role !== 'SALES') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { quoteId, ...extra } = body;

  if (!quoteId) {
    return NextResponse.json({ error: 'quoteId required' }, { status: 400 });
  }

  try {
    const so = await convertQuoteToSalesOrder(auth.tenantId!, quoteId, {
      ...extra,
      createdById: extra.createdById ?? auth.id,
    });
    return NextResponse.json(so, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Conversion failed';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
