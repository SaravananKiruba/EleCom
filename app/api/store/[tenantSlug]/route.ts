import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';

// GET /api/store/[tenantSlug] — public store info + branding
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tenantSlug: string }> },
) {
  const { tenantSlug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug },
    include: {
      tenantSettings: true,
      customDomains: { where: { isPrimary: true } },
    },
  });

  if (!tenant || tenant.status !== 'ACTIVE' || tenant.deletedAt) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 });
  }

  const settings = Object.fromEntries(tenant.tenantSettings.map(s => [s.key, s.value]));

  return NextResponse.json({
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    email: tenant.email,
    tagline: settings['store_tagline'] ?? `Welcome to ${tenant.name}`,
    logoUrl: settings['store_logo'] ?? null,
    primaryColor: settings['store_primary_color'] ?? '#6b8375',
    bannerText: settings['store_banner_text'] ?? null,
    primaryDomain: tenant.customDomains[0]?.domain ?? null,
  });
}
