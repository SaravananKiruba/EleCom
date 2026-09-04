import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import * as bcrypt from 'bcryptjs';
import { MembershipRole, UserStatus } from '@prisma/client';
import { requireTenant, isResponse } from '@/src/server/auth';

export async function GET(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const memberships = await prisma.userTenantMembership.findMany({
    where: { tenantId: auth.tenantId!, status: { not: 'INACTIVE' } },
    include: { user: { select: { id: true, name: true, email: true, lastLoginAt: true, createdAt: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(memberships.map(m => ({
    id: m.user.id,
    membershipId: m.id,
    name: m.user.name,
    email: m.user.email,
    role: m.role,
    status: m.status,
    lastLoginAt: m.user.lastLoginAt,
    createdAt: m.user.createdAt,
  })));
}

export async function POST(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, email, password, role } = await req.json();
  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }
  const allowed: MembershipRole[] = ['TENANT_ADMIN', 'SALES'];
  if (!allowed.includes(role as MembershipRole)) {
    return NextResponse.json({ error: 'Invalid role. Must be TENANT_ADMIN or SALES.' }, { status: 400 });
  }

  const normalEmail = email.toLowerCase().trim();

  // Find or create the platform-level user, then create a membership.
  let user = await prisma.user.findUnique({ where: { email: normalEmail } });
  if (!user) {
    user = await prisma.user.create({
      data: { name, email: normalEmail, passwordHash: await bcrypt.hash(password, 12), status: UserStatus.ACTIVE },
    });
  }

  const existing = await prisma.userTenantMembership.findUnique({
    where: { userId_tenantId: { userId: user.id, tenantId: auth.tenantId! } },
  });
  if (existing) return NextResponse.json({ error: 'This user already has a role at this tenant' }, { status: 409 });

  const membership = await prisma.userTenantMembership.create({
    data: { userId: user.id, tenantId: auth.tenantId!, role: role as MembershipRole, status: UserStatus.ACTIVE },
  });

  return NextResponse.json({
    id: user.id,
    membershipId: membership.id,
    name: user.name,
    email: user.email,
    role: membership.role,
    status: membership.status,
    createdAt: user.createdAt,
  }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    where: { tenantId: auth.tenantId!, deletedAt: null },
    select: { id: true, name: true, email: true, role: true, status: true, lastLoginAt: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, email, password, role } = await req.json();
  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 });
  }
  const allowed = ['TENANT_ADMIN', 'SALES'];
  if (!allowed.includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (exists) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { tenantId: auth.tenantId!, name, email: email.toLowerCase().trim(), passwordHash, role, status: 'ACTIVE' },
    select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
  });
  return NextResponse.json(user, { status: 201 });
}
