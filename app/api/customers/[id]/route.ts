import { NextRequest, NextResponse } from 'next/server';
import { getCustomerById, updateCustomer } from '@/src/server/services/customerService';
import { prisma } from '@/src/server/prisma';
import { requireTenant, isResponse } from '@/src/server/auth';
import { assertTenantOwnership } from '@/src/server/tenantContext';
import { CustomerStatus } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  const { id } = await params;
  try {
    const customer = await getCustomerById(auth.tenantId!, id);
    return NextResponse.json(customer);
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
  if (auth.role !== 'TENANT_ADMIN' && auth.role !== 'SALES') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();

  if (body.status) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    assertTenantOwnership(existing, auth.tenantId!, 'Customer');
    const updated = await prisma.customer.update({
      where: { id },
      data: { status: body.status as CustomerStatus },
    });
    return NextResponse.json(updated);
  }

  const updated = await updateCustomer(auth.tenantId!, id, body, auth.id);
  return NextResponse.json(updated);
}
