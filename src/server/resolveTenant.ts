import { NextRequest } from 'next/server';
import { prisma } from '@/src/server/prisma';

/**
 * Resolve which tenant a public request belongs to, in priority order:
 *  1. explicit `slug` param in body
 *  2. Host header (subdomain or custom domain)
 *  3. `crmboo-tenant-slug` cookie set by proxy for custom domains
 *
 * Returns `null` when no tenant can be resolved — callers should treat that as an error.
 */
export async function resolvePublicTenant(
  req: NextRequest,
  explicitSlug?: string,
): Promise<{ id: string; slug: string; name: string; status: string } | null> {
  const platformRoot = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'crmboo.io';

  const trySlug = async (slug: string) => {
    const t = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, slug: true, name: true, status: true, deletedAt: true },
    });
    return t && !t.deletedAt && t.status === 'ACTIVE' ? t : null;
  };

  if (explicitSlug) {
    const found = await trySlug(explicitSlug);
    if (found) return found;
  }

  const host = (req.headers.get('host') ?? '').split(':')[0];
  if (host && host.endsWith(`.${platformRoot}`)) {
    const slug = host.replace(`.${platformRoot}`, '');
    if (slug && slug !== 'www') {
      const found = await trySlug(slug);
      if (found) return found;
    }
  }

  // Custom-domain path: proxy sets a cookie once it matches the host.
  const cookieSlug = req.cookies.get('crmboo-tenant-slug')?.value;
  if (cookieSlug) {
    const found = await trySlug(cookieSlug);
    if (found) return found;
  }

  // Custom-domain fallback: direct DB lookup by domain
  if (host) {
    const record = await prisma.tenantCustomDomain.findUnique({
      where: { domain: host },
      include: { tenant: { select: { id: true, slug: true, name: true, status: true, deletedAt: true } } },
    });
    if (record?.tenant && !record.tenant.deletedAt && record.tenant.status === 'ACTIVE') {
      const { deletedAt: _d, ...rest } = record.tenant;
      return rest;
    }
  }

  return null;
}
