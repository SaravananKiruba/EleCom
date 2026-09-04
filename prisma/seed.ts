import { PrismaClient, Prisma, MembershipRole, UserStatus, BillingInterval, TenantStatus, CustomerStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CRMBoo...');

  // ── Plans ─────────────────────────────────────────────────────────
  await prisma.plan.upsert({
    where: { slug: 'starter' },
    update: {},
    create: {
      name: 'Starter', slug: 'starter',
      description: 'Up to 3 users, 500 customers',
      price: new Prisma.Decimal(999), currency: 'INR',
      billingInterval: BillingInterval.MONTHLY, trialDays: 14, isActive: true,
    },
  });

  await prisma.plan.upsert({
    where: { slug: 'pro' },
    update: {},
    create: {
      name: 'Pro', slug: 'pro',
      description: 'Up to 20 users, unlimited customers, advanced reports',
      price: new Prisma.Decimal(3999), currency: 'INR',
      billingInterval: BillingInterval.MONTHLY, trialDays: 14, isActive: true,
    },
  });

  // ── SaaS platform admin (no tenant, isSaasAdmin=true) ────────────
  const saasAdmin = await prisma.user.upsert({
    where: { email: 'admin@crmboo.io' },
    update: {},
    create: {
      name: 'Platform Admin',
      email: 'admin@crmboo.io',
      passwordHash: await bcrypt.hash('Admin@1234', 12),
      isSaasAdmin: true,
      status: UserStatus.ACTIVE,
    },
  });

  // ── Demo tenant ───────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      slug: 'demo',
      name: 'Demo Lighting Co.',
      email: 'demo@example.com',
      status: TenantStatus.ACTIVE,
    },
  });

  // Tenant admin user + membership
  const tenantAdmin = await prisma.user.upsert({
    where: { email: 'tenant@demo.com' },
    update: {},
    create: {
      name: 'Demo Admin',
      email: 'tenant@demo.com',
      passwordHash: await bcrypt.hash('Demo@1234', 12),
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.userTenantMembership.upsert({
    where: { userId_tenantId: { userId: tenantAdmin.id, tenantId: tenant.id } },
    update: {},
    create: {
      userId: tenantAdmin.id,
      tenantId: tenant.id,
      role: MembershipRole.TENANT_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  // Demo customer CRM record + user + membership
  const customerCrm = await prisma.customer.upsert({
    where: { tenantId_customerCode: { tenantId: tenant.id, customerCode: 'CUS-000001' } },
    update: {},
    create: {
      tenantId: tenant.id,
      customerCode: 'CUS-000001',
      companyName: 'Sharma Constructions',
      contactPerson: 'Ravi Sharma',
      email: 'customer@demo.com',
      phone: '9000000001',
      status: CustomerStatus.ACTIVE,
    },
  });

  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@demo.com' },
    update: {},
    create: {
      name: 'Ravi Sharma',
      email: 'customer@demo.com',
      passwordHash: await bcrypt.hash('Demo@1234', 12),
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.userTenantMembership.upsert({
    where: { userId_tenantId: { userId: customerUser.id, tenantId: tenant.id } },
    update: {},
    create: {
      userId: customerUser.id,
      tenantId: tenant.id,
      role: MembershipRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      linkedCustomerId: customerCrm.id,
    },
  });

  console.log(`
✅  Seeding done.

  Platform Admin : admin@crmboo.io   / Admin@1234  → /saas-admin
  Tenant Admin   : tenant@demo.com   / Demo@1234   → /admin
  Customer       : customer@demo.com / Demo@1234   → /store/demo/dashboard
  `);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
