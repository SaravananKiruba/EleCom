import { prisma } from '@/src/server/prisma';
import { tenantScope, assertTenantOwnership } from '@/src/server/tenantContext';
import { audit } from './auditService';
import { CustomerStatus, Prisma } from '@prisma/client';

export interface CreateCustomerInput {
  tenantId: string;
  customerCode: string;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  gstNumber?: string;
  businessType?: string;
  notes?: string;
  createdById?: string;
}

export async function createCustomer(input: CreateCustomerInput) {
  const customer = await prisma.customer.create({
    data: {
      tenantId: input.tenantId,
      customerCode: input.customerCode,
      companyName: input.companyName,
      contactPerson: input.contactPerson,
      email: input.email,
      phone: input.phone,
      gstNumber: input.gstNumber,
      businessType: input.businessType,
      notes: input.notes,
      status: CustomerStatus.LEAD,
    },
  });

  await audit({
    tenantId: input.tenantId,
    userId: input.createdById,
    entityType: 'Customer',
    entityId: customer.id,
    action: 'CREATE',
    newValues: { companyName: customer.companyName },
  });

  return customer;
}

export async function getCustomers(
  tenantId: string,
  options?: { status?: CustomerStatus; search?: string; skip?: number; take?: number },
) {
  const where: Prisma.CustomerWhereInput = {
    ...tenantScope(tenantId),
    deletedAt: null,
    ...(options?.status && { status: options.status }),
    ...(options?.search && {
      OR: [
        { companyName: { contains: options.search } },
        { email: { contains: options.search } },
        { phone: { contains: options.search } },
      ],
    }),
  };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: options?.skip,
      take: options?.take,
    }),
    prisma.customer.count({ where }),
  ]);

  return { customers, total };
}

export async function getCustomerById(tenantId: string, customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { contacts: true, addresses: true },
  });
  assertTenantOwnership(customer, tenantId, 'Customer');
  return customer;
}

export async function updateCustomer(
  tenantId: string,
  customerId: string,
  data: Partial<CreateCustomerInput>,
  updatedById?: string,
) {
  const existing = await prisma.customer.findUnique({ where: { id: customerId } });
  assertTenantOwnership(existing, tenantId, 'Customer');

  const updated = await prisma.customer.update({
    where: { id: customerId },
    data: {
      companyName: data.companyName,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      gstNumber: data.gstNumber,
      businessType: data.businessType,
      notes: data.notes,
    },
  });

  await audit({
    tenantId,
    userId: updatedById,
    entityType: 'Customer',
    entityId: customerId,
    action: 'UPDATE',
    oldValues: { companyName: existing.companyName },
    newValues: { companyName: updated.companyName },
  });

  return updated;
}
