import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { ArchitectStatus, MembershipRole, UserStatus, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { resolvePublicTenant } from '@/src/server/resolveTenant';

// POST /api/architects/register — architect self-registration (status: PROSPECT until approved by tenant admin)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { firmName, contactPerson, email, password, phone, licenseNumber, city, tenantSlug } = body;

  if (!firmName || !contactPerson || !email || !password || !phone || !licenseNumber) {
    return NextResponse.json({ error: 'firmName, contactPerson, email, password, phone, licenseNumber are required' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const tenant = await resolvePublicTenant(req, tenantSlug);
  if (!tenant) {
    return NextResponse.json({ error: 'No active tenant found for this request. Contact support.' }, { status: 404 });
  }

  const normalEmail = email.toLowerCase().trim();

  try {
    const result = await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({ where: { email: normalEmail } });
      if (!user) {
        user = await tx.user.create({
          data: {
            name: contactPerson,
            email: normalEmail,
            passwordHash: await bcrypt.hash(password, 12),
            status: UserStatus.ACTIVE,
          },
        });
      }

      // Check if already registered at this tenant.
      const existing = await tx.userTenantMembership.findUnique({
        where: { userId_tenantId: { userId: user.id, tenantId: tenant.id } },
      });
      if (existing) throw Object.assign(new Error('DUPLICATE_MEMBERSHIP'), { code: 'DUPLICATE_MEMBERSHIP' });

      const count = await tx.architect.count({ where: { tenantId: tenant.id } });
      const architectCode = `ARC-${String(count + 1).padStart(6, '0')}`;

      // Also create a Customer record so the architect can place RFQs and orders.
      const custCount = await tx.customer.count({ where: { tenantId: tenant.id } });
      const customerCode = `CUS-${String(custCount + 1).padStart(6, '0')}`;
      const customer = await tx.customer.create({
        data: {
          tenantId: tenant.id,
          customerCode,
          companyName: firmName,
          contactPerson,
          email: normalEmail,
          phone,
          status: 'ACTIVE',
        },
      });

      const architect = await tx.architect.create({
        data: {
          tenantId: tenant.id,
          architectCode,
          firmName,
          contactPerson,
          email: normalEmail,
          phone,
          licenseNumber,
          city,
          status: ArchitectStatus.PROSPECT,
        },
      });

      const membership = await tx.userTenantMembership.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          role: MembershipRole.ARCHITECT,
          status: UserStatus.ACTIVE,
          linkedCustomerId: customer.id,
          linkedArchitectId: architect.id,
        },
      });

      return { architect, customer, user, membership };
    });

    return NextResponse.json({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: 'ARCHITECT',
      tenantId: tenant.id,
      tenantName: tenant.name,
      architectId: result.architect.id,
      customerId: result.customer.id,
      status: result.architect.status,
      message: 'Registration successful. Your architect account is pending approval.',
    }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'DUPLICATE_MEMBERSHIP') {
      return NextResponse.json({ error: 'You already have an account at this store. Please sign in.' }, { status: 409 });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'An account with this email already exists at this store' }, { status: 409 });
    }
    throw err;
  }
}

// POST /api/architects/register — architect self-registration (status: PROSPECT until approved)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { firmName, contactPerson, email, password, phone, licenseNumber, city, tenantSlug } = body;

  if (!firmName || !contactPerson || !email || !password || !phone || !licenseNumber) {
    return NextResponse.json({ error: 'firmName, contactPerson, email, password, phone, licenseNumber are required' }, { status: 400 });
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
      const count = await tx.architect.count({ where: { tenantId: tenant.id } });
      const architectCode = `ARC-${String(count + 1).padStart(6, '0')}`;

      const architect = await tx.architect.create({
        data: {
          tenantId: tenant.id,
          architectCode,
          firmName,
          contactPerson,
          email: email.toLowerCase().trim(),
          phone,
          licenseNumber,
          city,
          status: ArchitectStatus.PROSPECT, // pending approval by tenant admin
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: contactPerson,
          email: email.toLowerCase().trim(),
          passwordHash: await bcrypt.hash(password, 12),
          role: UserRole.ARCHITECT,
          status: UserStatus.ACTIVE,
        },
      });

      return { architect, user };
    });

    return NextResponse.json({
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: result.user.role,
      tenantId: tenant.id,
      tenantName: tenant.name,
      architectId: result.architect.id,
      status: result.architect.status, // PROSPECT — pending admin approval
      redirect: '/catalogue',
    }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    throw err;
  }
}
