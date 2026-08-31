import { NextRequest, NextResponse } from 'next/server';
import { bulkImportProducts, BulkImportRow } from '@/src/server/services/productService';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tenantId, rows } = body as { tenantId: string; rows: BulkImportRow[] };

  if (!tenantId) return NextResponse.json({ error: 'tenantId required' }, { status: 400 });
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'rows array required' }, { status: 400 });
  }
  if (rows.length > 500) {
    return NextResponse.json({ error: 'Maximum 500 rows per import' }, { status: 400 });
  }

  const results = await bulkImportProducts(tenantId, rows);
  return NextResponse.json(results, { status: results.created > 0 ? 201 : 422 });
}
