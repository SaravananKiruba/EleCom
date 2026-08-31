import { PrismaClient, Prisma, UserRole, UserStatus, BillingInterval } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CRMBoo...');

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

  await prisma.user.upsert({
    where: { email: 'admin@crmboo.io' },
    update: {},
    create: {
      name: 'Platform Admin',
      email: 'admin@crmboo.io',
      passwordHash: await bcrypt.hash('Admin@1234', 12),
      role: UserRole.SAAS_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Done. SaaS Admin: admin@crmboo.io / Admin@1234');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
