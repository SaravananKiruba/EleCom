import { prisma } from '@/src/server/prisma';
import { tenantScope, assertTenantOwnership } from '@/src/server/tenantContext';
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

// ── helpers ──────────────────────────────────────────────────

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function uniqueSlug(tenantId: string, base: string, excludeId?: string) {
  let slug = toSlug(base);
  let n = 0;
  while (true) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const existing = await prisma.product.findUnique({ where: { tenantId_slug: { tenantId, slug: candidate } } });
    if (!existing || existing.id === excludeId) return candidate;
    n++;
  }
}

export interface ProductInput {
  name: string;
  sku: string;
  brandId?: string | null;
  categoryId?: string | null;
  shortDescription?: string;
  description?: string;
  imageUrl?: string;
  basePrice?: number | null;
  status?: ProductStatus;
  isFeatured?: boolean;
  specifications?: { specKey: string; specValue: string; unit?: string; sortOrder?: number }[];
  variants?: { sku: string; name: string; price?: number | null; isActive?: boolean }[];
}

export async function createProduct(tenantId: string, data: ProductInput) {
  const slug = await uniqueSlug(tenantId, data.name);
  return prisma.product.create({
    data: {
      tenantId,
      slug,
      name: data.name,
      sku: data.sku,
      brandId: data.brandId ?? null,
      categoryId: data.categoryId ?? null,
      shortDescription: data.shortDescription ?? null,
      description: data.description ?? null,
      imageUrl: data.imageUrl ?? null,
      basePrice: data.basePrice != null ? data.basePrice : null,
      status: data.status ?? 'DRAFT',
      isFeatured: data.isFeatured ?? false,
      specifications: data.specifications?.length
        ? { createMany: { data: data.specifications.map((s, i) => ({ specKey: s.specKey, specValue: s.specValue, unit: s.unit, sortOrder: s.sortOrder ?? i })) } }
        : undefined,
    },
    include: { brand: true, category: true, specifications: true, variants: true },
  });
}

export async function updateProduct(tenantId: string, id: string, data: Partial<ProductInput>) {
  const existing = await prisma.product.findUnique({ where: { id } });
  assertTenantOwnership(existing, tenantId, 'Product');

  const slug = data.name ? await uniqueSlug(tenantId, data.name, id) : undefined;

  // Replace specifications if provided
  if (data.specifications !== undefined) {
    await prisma.productSpecification.deleteMany({ where: { productId: id } });
    if (data.specifications.length) {
      await prisma.productSpecification.createMany({
        data: data.specifications.map((s, i) => ({ productId: id, specKey: s.specKey, specValue: s.specValue, unit: s.unit, sortOrder: s.sortOrder ?? i })),
      });
    }
  }

  return prisma.product.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name, slug }),
      ...(data.sku !== undefined && { sku: data.sku }),
      ...(data.brandId !== undefined && { brandId: data.brandId }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      ...(data.basePrice !== undefined && { basePrice: data.basePrice }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
    },
    include: { brand: true, category: true, specifications: true, variants: true },
  });
}

export async function deleteProduct(tenantId: string, id: string) {
  const existing = await prisma.product.findUnique({ where: { id } });
  assertTenantOwnership(existing, tenantId, 'Product');
  return prisma.product.update({ where: { id }, data: { deletedAt: new Date() } });
}

export async function getBrands(tenantId: string) {
  return prisma.brand.findMany({ where: { tenantId, isActive: true }, orderBy: { name: 'asc' } });
}

export async function getCategories(tenantId: string) {
  return prisma.category.findMany({ where: { tenantId, isActive: true, parentId: null }, orderBy: { name: 'asc' }, include: { children: { where: { isActive: true } } } });
}

export async function upsertBrand(tenantId: string, name: string) {
  const slug = toSlug(name);
  return prisma.brand.upsert({
    where: { tenantId_slug: { tenantId, slug } },
    update: {},
    create: { tenantId, name, slug },
  });
}

export async function upsertCategory(tenantId: string, name: string) {
  const slug = toSlug(name);
  return prisma.category.upsert({
    where: { tenantId_slug: { tenantId, slug } },
    update: {},
    create: { tenantId, name, slug },
  });
}

export interface BulkImportRow {
  name: string;
  sku: string;
  brandName?: string;
  categoryName?: string;
  shortDescription?: string;
  description?: string;
  imageUrl?: string;
  basePrice?: string | number;
  status?: string;
  specKeys?: string;   // pipe-separated: "Wattage|Color Temp|IP Rating"
  specValues?: string; // pipe-separated: "36W|4000K|IP54"
}

export async function bulkImportProducts(tenantId: string, rows: BulkImportRow[]) {
  const results = { created: 0, skipped: 0, errors: [] as string[] };

  for (const row of rows) {
    if (!row.name?.trim() || !row.sku?.trim()) {
      results.errors.push(`Skipped row — missing name or SKU: ${JSON.stringify(row)}`);
      results.skipped++;
      continue;
    }
    try {
      const existing = await prisma.product.findUnique({ where: { tenantId_sku: { tenantId, sku: row.sku.trim() } } });
      if (existing) {
        results.errors.push(`SKU already exists, skipped: ${row.sku}`);
        results.skipped++;
        continue;
      }

      let brandId: string | null = null;
      if (row.brandName?.trim()) {
        const brand = await upsertBrand(tenantId, row.brandName.trim());
        brandId = brand.id;
      }

      let categoryId: string | null = null;
      if (row.categoryName?.trim()) {
        const cat = await upsertCategory(tenantId, row.categoryName.trim());
        categoryId = cat.id;
      }

      const specs: { specKey: string; specValue: string; sortOrder: number }[] = [];
      if (row.specKeys && row.specValues) {
        const keys = String(row.specKeys).split('|');
        const vals = String(row.specValues).split('|');
        keys.forEach((k, i) => { if (k.trim() && vals[i]?.trim()) specs.push({ specKey: k.trim(), specValue: vals[i].trim(), sortOrder: i }); });
      }

      const slug = await uniqueSlug(tenantId, row.name.trim());
      const price = row.basePrice != null && row.basePrice !== '' ? Number(row.basePrice) : null;
      const statusRaw = String(row.status ?? '').toUpperCase();
      const status: ProductStatus = (['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] as ProductStatus[]).includes(statusRaw as ProductStatus) ? (statusRaw as ProductStatus) : 'ACTIVE';

      await prisma.product.create({
        data: {
          tenantId, slug, name: row.name.trim(), sku: row.sku.trim(),
          brandId, categoryId,
          shortDescription: row.shortDescription?.trim() ?? null,
          description: row.description?.trim() ?? null,
          imageUrl: row.imageUrl?.trim() ?? null,
          basePrice: price,
          status,
          specifications: specs.length ? { createMany: { data: specs } } : undefined,
        },
      });
      results.created++;
    } catch (err) {
      results.errors.push(`Error on SKU ${row.sku}: ${(err as Error).message}`);
      results.skipped++;
    }
  }

  return results;
}
