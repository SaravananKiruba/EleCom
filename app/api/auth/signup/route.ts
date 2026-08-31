import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { CustomerStatus, UserRole, UserStatus, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// POST /api/auth/signup — customer self-registration
// Body: { companyName, contactPerson, email, password, phone, gstNumber?, tenantSlug? }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { companyName, contactPerson, email, password, phone, gstNumber, tenantSlug } = body;

  if (!companyName || !contactPerson || !email || !password || !phone) {
    return NextResponse.json({ error: 'companyName, contactPerson, email, password, phone are required' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  // Resolve tenant — use slug if provided, otherwise first active tenant
  const tenant = tenantSlug
    ? await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    : await prisma.tenant.findFirst({ where: { status: 'ACTIVE', deletedAt: null }, orderBy: { createdAt: 'asc' } });

  if (!tenant || tenant.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'No active tenant found. Please contact support.' }, { status: 404 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Generate customer code
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

    return NextResponse.json({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      tenantId: tenant.id,
      tenantName: tenant.name,
      tenantSlug: tenant.slug,
      customerId: result.customer.id,
      redirect: '/dashboard',
    }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    throw err;
  }
}
