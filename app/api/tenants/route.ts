import { NextRequest, NextResponse } from 'next/server';
import { getTenants } from '@/src/server/services/tenantService';
import { prisma } from '@/src/server/prisma';
import { TenantStatus, UserRole, UserStatus, SubscriptionStatus, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { requireRole, isResponse } from '@/src/server/auth';

export async function GET(req: NextRequest) {
  const auth = requireRole(req, ['SAAS_ADMIN']);
  if (isResponse(auth)) return auth;

  const { searchParams } = req.nextUrl;
  const result = await getTenants({
    status: searchParams.get('status') as never ?? undefined,
    skip: Number(searchParams.get('skip') ?? 0),
    take: Number(searchParams.get('take') ?? 50),
  });
  return NextResponse.json(result);
}

// POST /api/tenants — SaaS admin creates a new tenant + tenant admin user
export async function POST(req: NextRequest) {
  const auth = requireRole(req, ['SAAS_ADMIN']);
  if (isResponse(auth)) return auth;

  const body = await req.json();
  const { name, email, phone, gstNumber, industry, adminName, adminEmail, adminPassword, planSlug } = body;

  if (!name || !email || !adminName || !adminEmail || !adminPassword) {
    return NextResponse.json({ error: 'name, email, adminName, adminEmail, adminPassword are required' }, { status: 400 });
  }

  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!baseSlug) {
    return NextResponse.json({ error: 'name must contain letters or digits' }, { status: 400 });
  }
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
          name,
          email,
          phone,
          gstNumber,
          industry,
          status: TenantStatus.ACTIVE,
        },
      });

      const adminUser = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name: adminName,
          email: adminEmail.toLowerCase().trim(),
          passwordHash: await bcrypt.hash(adminPassword, 12),
          role: UserRole.TENANT_ADMIN,
          status: UserStatus.ACTIVE,
        },
      });

      if (planSlug) {
        const plan = await tx.plan.findUnique({ where: { slug: planSlug } });
        if (plan) {
          await tx.subscription.create({
            data: {
              tenantId: tenant.id,
              planId: plan.id,
              status: SubscriptionStatus.TRIAL,
              trialStartDate: new Date(),
              trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
          });
        }
      }

      return { tenant, adminUser };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'A tenant with this name or email already exists' }, { status: 409 });
    }
    throw err;
  }
}
