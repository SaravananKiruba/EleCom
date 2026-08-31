import { prisma } from '@/src/server/prisma';
import { tenantScope } from '@/src/server/tenantContext';
import { ProductStatus, Prisma } from '@prisma/client';

export async function getProducts(
  tenantId: string,
  options?: {
    categoryId?: string;
    brandId?: string;
    status?: ProductStatus;
    search?: string;
    skip?: number;
    take?: number;
  },
) {
  const where: Prisma.ProductWhereInput = {
    ...tenantScope(tenantId),
    deletedAt: null,
    ...(options?.categoryId && { categoryId: options.categoryId }),
    ...(options?.brandId && { brandId: options.brandId }),
    ...(options?.status && { status: options.status }),
    ...(options?.search && {
      OR: [
        { name: { contains: options.search } },
        { sku: { contains: options.search } },
      ],
    }),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { brand: true, category: true, specifications: true, variants: true },
      orderBy: { name: 'asc' },
      skip: options?.skip,
      take: options?.take,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total };
}

export async function getProductBySlug(tenantId: string, slug: string) {
  return prisma.product.findUnique({
    where: { tenantId_slug: { tenantId, slug } },
    include: {
      brand: true,
      category: true,
      specifications: { orderBy: { sortOrder: 'asc' } },
      variants: { where: { isActive: true } },
      documents: true,
    },
  });
}
