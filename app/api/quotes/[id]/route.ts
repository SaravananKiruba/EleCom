import { NextRequest, NextResponse } from 'next/server';
import { getQuoteById, updateQuoteStatus } from '@/src/server/services/quoteService';
import { requireTenant, isResponse } from '@/src/server/auth';
import { QuoteStatus } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  const { id } = await params;
  try {
    const quote = await getQuoteById(auth.tenantId!, id);
    if (auth.role === 'CUSTOMER' && auth.customerId && quote.customerId !== auth.customerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json(quote);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  const { id } = await params;
  const body = await req.json();
  const status = body.status as QuoteStatus;

  // Customers can only ACCEPT or REJECT their own quotes.
  if (auth.role === 'CUSTOMER') {
    if (status !== 'ACCEPTED' && status !== 'REJECTED') {
      return NextResponse.json({ error: 'Customers may only accept or reject a quote' }, { status: 403 });
    }
    const quote = await getQuoteById(auth.tenantId!, id).catch(() => null);
    if (!quote || quote.customerId !== auth.customerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } else if (auth.role !== 'TENANT_ADMIN' && auth.role !== 'SALES') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const quote = await updateQuoteStatus(auth.tenantId!, id, status, auth.id, {
      rejectionReason: body.rejectionReason,
    });
    return NextResponse.json(quote);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: msg }, { status: 422 });
  }
}
