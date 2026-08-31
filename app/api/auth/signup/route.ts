import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { CustomerStatus, UserRole, UserStatus, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { resolvePublicTenant } from '@/src/server/resolveTenant';
import { AUTH_COOKIE, signToken } from '@/src/server/auth';

// POST /api/auth/signup — customer self-registration
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { companyName, contactPerson, email, password, phone, gstNumber, tenantSlug } = body;

  if (!companyName || !contactPerson || !email || !password || !phone) {
    return NextResponse.json({ error: 'companyName, contactPerson, email, password, phone are required' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const tenant = await resolvePublicTenant(req, tenantSlug);
  if (!tenant) {
    return NextResponse.json({ error: 'No active tenant found for this request. Contact support.' }, { status: 404 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const count = await tx.customer.count({ where: { tenantId: tenant.id } });
      const customerCode = `CUS-${String(count + 1).padStart(6, '0')}`;

      const customer = await tx.customer.create({
        data: {
          tenantId: tenant.id,
          customerCode,
          companyName,
          contactPerson,
          email: email.toLowerCase().trim(),
          phone,
          gstNumber,
          status: CustomerStatus.ACTIVE,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: contactPerson,
          email: email.toLowerCase().trim(),
          passwordHash: await bcrypt.hash(password, 12),
          role: UserRole.CUSTOMER,
          status: UserStatus.ACTIVE,
        },
      });

      return { customer, user };
    });

    const payload = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: 'CUSTOMER' as const,
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      customerId: result.customer.id,
    };
    const token = signToken(payload);

    const res = NextResponse.json({ ...payload, redirect: '/dashboard' }, { status: 201 });
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    return res;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    throw err;
  }
}
