import { NextRequest, NextResponse } from 'next/server';
import { getFollowUps, createFollowUp, updateFollowUpStatus } from '@/src/server/services/followUpService';
import { requireTenant, isResponse } from '@/src/server/auth';
import { FollowUpMethod, FollowUpStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN' && auth.role !== 'SALES') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const result = await getFollowUps(auth.tenantId!, {
    status: searchParams.get('status') as never ?? undefined,
    skip: Number(searchParams.get('skip') ?? 0),
    take: Number(searchParams.get('take') ?? 100),
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
  const fu = await createFollowUp({
    tenantId: auth.tenantId!,
    quoteId: body.quoteId,
    customerId: body.customerId,
    assignedToId: body.assignedToId,
    method: body.method as FollowUpMethod | undefined,
    subject: body.subject,
    notes: body.notes,
    nextFollowUpAt: body.nextFollowUpAt ? new Date(body.nextFollowUpAt) : undefined,
  });
  return NextResponse.json(fu, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN' && auth.role !== 'SALES') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const body = await req.json();
  const { id, status } = body;
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 });
  const fu = await updateFollowUpStatus(auth.tenantId!, id, status as FollowUpStatus);
  return NextResponse.json(fu);
}
