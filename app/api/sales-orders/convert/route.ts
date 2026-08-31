import { NextRequest, NextResponse } from 'next/server';
import { convertQuoteToSalesOrder } from '@/src/server/services/salesOrderService';

// POST /api/sales-orders/convert — { tenantId, quoteId, ...extra }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tenantId, quoteId, ...extra } = body;

  if (!tenantId || !quoteId) {
    return NextResponse.json({ error: 'tenantId and quoteId required' }, { status: 400 });
  }

  try {
    const so = await convertQuoteToSalesOrder(tenantId, quoteId, extra);
    return NextResponse.json(so, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Conversion failed';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
