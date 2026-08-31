import { prisma } from '@/src/server/prisma';
import { DocumentType } from '@prisma/client';

/**
 * Atomically increments and returns the next document number for a tenant.
 * Uses a SELECT ... FOR UPDATE inside a transaction to prevent race conditions.
 */
export async function nextDocumentNumber(
  tenantId: string,
  documentType: DocumentType,
  year: number,
): Promise<string> {
  return prisma.$transaction(async (tx) => {
    // Upsert the sequence row, then increment with a raw query to lock the row
    await tx.documentSequence.upsert({
      where: { tenantId_documentType_year: { tenantId, documentType, year } },
      create: { tenantId, documentType, year, nextNumber: 1 },
      update: {},
    });

    // Lock and increment atomically
    await tx.$executeRaw`
      UPDATE DocumentSequence
      SET nextNumber = nextNumber + 1
      WHERE tenantId = ${tenantId}
        AND documentType = ${documentType}
        AND year = ${year}
    `;

    const seq = await tx.documentSequence.findUniqueOrThrow({
      where: { tenantId_documentType_year: { tenantId, documentType, year } },
    });

    const prefix =
      documentType === 'RFQ' ? 'RFQ' : documentType === 'QUOTE' ? 'QTE' : 'SO';

    return `${prefix}-${year}-${String(seq.nextNumber - 1).padStart(6, '0')}`;
  });
}
