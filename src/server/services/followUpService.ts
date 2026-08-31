import { prisma } from '@/src/server/prisma';
import { tenantScope, assertTenantOwnership } from '@/src/server/tenantContext';
import { FollowUpMethod, FollowUpStatus, Prisma } from '@prisma/client';

export interface CreateFollowUpInput {
  tenantId: string;
  quoteId: string;
  customerId: string;
  assignedToId?: string;
  method?: FollowUpMethod;
  subject?: string;
  notes?: string;
  nextFollowUpAt?: Date;
}

export async function createFollowUp(input: CreateFollowUpInput) {
  return prisma.followUp.create({
    data: {
      tenantId: input.tenantId,
      quoteId: input.quoteId,
      customerId: input.customerId,
      assignedToId: input.assignedToId,
      method: input.method ?? FollowUpMethod.PHONE,
      subject: input.subject,
      notes: input.notes,
      nextFollowUpAt: input.nextFollowUpAt,
      status: FollowUpStatus.OPEN,
    },
  });
}

export async function getFollowUps(
  tenantId: string,
  options?: { status?: FollowUpStatus; skip?: number; take?: number },
) {
  const where: Prisma.FollowUpWhereInput = {
    ...tenantScope(tenantId),
    ...(options?.status && { status: options.status }),
  };

  const [followUps, total] = await Promise.all([
    prisma.followUp.findMany({
      where,
      include: { customer: true, quote: true, assignedTo: true },
      orderBy: { nextFollowUpAt: 'asc' },
      skip: options?.skip,
      take: options?.take,
    }),
    prisma.followUp.count({ where }),
  ]);

  return { followUps, total };
}

export async function updateFollowUpStatus(
  tenantId: string,
  followUpId: string,
  status: FollowUpStatus,
) {
  const existing = await prisma.followUp.findUnique({ where: { id: followUpId } });
  if (!existing || existing.tenantId !== tenantId) {
    throw new Error('FollowUp not found or access denied');
  }
  return prisma.followUp.update({ where: { id: followUpId }, data: { status } });
}
