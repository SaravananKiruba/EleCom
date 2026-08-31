import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';
import { requireTenant, isResponse } from '@/src/server/auth';

export async function POST(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { tagline, primaryColor, bannerText } = await req.json();
  const tenantId = auth.tenantId!;

  const upsert = async (key: string, value: string | undefined) => {
    if (value === undefined) return;
    await prisma.tenantSetting.upsert({
      where: { tenantId_key: { tenantId, key } },
      create: { tenantId, key, value },
      update: { value },
    });
  };

  await Promise.all([
    upsert('store_tagline', tagline),
    upsert('store_primary_color', primaryColor),
    upsert('store_banner_text', bannerText),
  ]);

  return NextResponse.json({ ok: true });
}
