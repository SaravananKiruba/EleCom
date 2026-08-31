import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import * as bcrypt from 'bcryptjs';
import { AUTH_COOKIE, signToken, AuthUser } from '@/src/server/auth';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { tenant: { select: { id: true, name: true, slug: true, status: true } } },
  });

  if (!user || user.deletedAt) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  if (user.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Your account is suspended. Contact support.' }, { status: 403 });
  }

  if (user.tenant && user.tenant.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Your company account is not active. Contact support.' }, { status: 403 });
  }

  // Resolve linked CRM record so downstream APIs can scope by them.
  let customerId: string | undefined;
  let architectId: string | undefined;
  if (user.role === 'CUSTOMER' && user.tenantId && user.email) {
    const c = await prisma.customer.findFirst({
      where: { tenantId: user.tenantId, email: user.email },
      select: { id: true },
    });
    customerId = c?.id;
  }
  if (user.role === 'ARCHITECT' && user.tenantId && user.email) {
    const a = await prisma.architect.findFirst({
      where: { tenantId: user.tenantId, email: user.email },
      select: { id: true },
    });
    architectId = a?.id;
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const redirectMap: Record<string, string> = {
    SAAS_ADMIN: '/saas-admin',
    TENANT_ADMIN: '/admin',
    SALES: '/admin',
    CUSTOMER: '/dashboard',
    ARCHITECT: '/architect-portal',
  };

  const payload: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId ?? undefined,
    tenantName: user.tenant?.name ?? undefined,
    tenantSlug: user.tenant?.slug ?? undefined,
    customerId,
    architectId,
  };

  const token = signToken(payload);

  const res = NextResponse.json({ ...payload, redirect: redirectMap[user.role] ?? '/' });
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}
