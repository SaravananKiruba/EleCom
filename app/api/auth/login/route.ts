import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import * as bcrypt from 'bcryptjs';

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

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  // Determine redirect based on role
  const redirectMap: Record<string, string> = {
    SAAS_ADMIN: '/saas-admin',
    TENANT_ADMIN: '/admin',
    SALES: '/admin',
    CUSTOMER: '/dashboard',
    ARCHITECT: '/catalogue',
  };

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
    tenantName: user.tenant?.name,
    tenantSlug: user.tenant?.slug,
    redirect: redirectMap[user.role] ?? '/',
  });
}
