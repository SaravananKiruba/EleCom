import { NextRequest, NextResponse } from 'next/server';
import { getTenants, approveTenant, suspendTenant, getTenantKPIs } from '@/src/server/services/tenantService';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const result = await getTenants({
    status: searchParams.get('status') as never ?? undefined,
    skip: Number(searchParams.get('skip') ?? 0),
    take: Number(searchParams.get('take') ?? 50),
  });
  return NextResponse.json(result);
}
