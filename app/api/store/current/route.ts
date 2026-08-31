import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { resolvePublicTenant } from '@/src/server/resolveTenant';

// GET /api/store/current — resolve tenant from Host (or slug cookie) and return public branding.
export async function GET(req: NextRequest) {
  const tenant = await resolvePublicTenant(req);
  if (!tenant) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

  const settings = await prisma.tenantSetting.findMany({ where: { tenantId: tenant.id } });
  const map = Object.fromEntries(settings.map(s => [s.key, s.value]));

  return NextResponse.json({
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    tagline: map['store_tagline'] ?? `Welcome to ${tenant.name}`,
    logoUrl: map['store_logo'] ?? null,
    primaryColor: map['store_primary_color'] ?? '#6b8375',
    bannerText: map['store_banner_text'] ?? null,
  });
}
