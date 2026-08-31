import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/server/prisma';

// POST /api/store/settings — upsert tenant store settings
export async function POST(req: NextRequest) {
  const { tenantId, tagline, primaryColor, bannerText } = await req.json();
  if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 });

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
