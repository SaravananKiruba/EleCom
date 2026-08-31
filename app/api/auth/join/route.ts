import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { TenantStatus, UserRole, UserStatus, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// POST /api/auth/join — tenant self-registration
// Creates tenant(PENDING_APPROVAL) + tenant admin user
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { companyName, legalName, email, phone, gstNumber, industry,
          adminName, adminEmail, adminPassword } = body;

  if (!companyName || !email || !adminName || !adminEmail || !adminPassword) {
    return NextResponse.json({ error: 'companyName, email, adminName, adminEmail, adminPassword are required' }, { status: 400 });
  }
  if (adminPassword.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const baseSlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!baseSlug) {
    return NextResponse.json({ error: 'Company name must contain letters or digits' }, { status: 400 });
  }

  // Find a free slug: base, base-2, base-3, ...
  let slug = baseSlug;
  for (let i = 2; i < 100; i++) {
    const exists = await prisma.tenant.findUnique({ where: { slug }, select: { id: true } });
    if (!exists) break;
    slug = `${baseSlug}-${i}`;
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          slug,
          name: companyName,
          legalName,
          email,
          phone,
          gstNumber,
          industry,
          status: TenantStatus.PENDING_APPROVAL,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: adminName,
          email: adminEmail.toLowerCase().trim(),
          passwordHash: await bcrypt.hash(adminPassword, 12),
          role: UserRole.TENANT_ADMIN,
          status: UserStatus.ACTIVE,
        },
      });

      return { tenant, user };
    });

    return NextResponse.json({
      tenantId: result.tenant.id,
      tenantName: result.tenant.name,
      tenantSlug: result.tenant.slug,
      status: result.tenant.status,
      message: 'Registration successful. Your account is pending approval. You will be notified once approved.',
    }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'A company with this name or email already exists' }, { status: 409 });
    }
    throw err;
  }
}
