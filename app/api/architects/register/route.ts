import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { ArchitectStatus, UserRole, UserStatus, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { resolvePublicTenant } from '@/src/server/resolveTenant';
import { AUTH_COOKIE, signToken } from '@/src/server/auth';

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
