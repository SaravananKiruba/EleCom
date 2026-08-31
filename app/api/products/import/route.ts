import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { bulkImportProducts, BulkImportRow } from '@/src/server/services/productService';
import { requireTenant, isResponse } from '@/src/server/auth';

export async function POST(req: NextRequest) {
  const auth = requireTenant(req);
  if (isResponse(auth)) return auth;
  if (auth.role !== 'TENANT_ADMIN' && auth.role !== 'SALES') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const tenantId = auth.tenantId!;
  const contentType = req.headers.get('content-type') ?? '';

  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const wb = new ExcelJS.Workbook();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (wb.xlsx as any).load(arrayBuffer);

    const ws = wb.worksheets[0];
    if (!ws) return NextResponse.json({ error: 'No worksheet found' }, { status: 422 });

    const headers: string[] = [];
    ws.getRow(1).eachCell(cell => headers.push(String(cell.value ?? '').trim()));

    const rows: BulkImportRow[] = [];
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const obj: Record<string, string> = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const key = headers[colNumber - 1];
        if (key) obj[key] = cell.value != null ? String(cell.value) : '';
      });
      rows.push(obj as unknown as BulkImportRow);
    });

    if (rows.length === 0) return NextResponse.json({ error: 'No data rows found' }, { status: 422 });
    if (rows.length > 500) return NextResponse.json({ error: 'Maximum 500 rows per import' }, { status: 400 });

    const results = await bulkImportProducts(tenantId, rows);
    return NextResponse.json({ ...results, total: rows.length }, { status: results.created > 0 ? 201 : 422 });
  }

  const body = await req.json();
  const { rows } = body as { rows: BulkImportRow[] };
  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: 'rows array required' }, { status: 400 });
  }
  if (rows.length > 500) return NextResponse.json({ error: 'Maximum 500 rows per import' }, { status: 400 });

  const results = await bulkImportProducts(tenantId, rows);
  return NextResponse.json(results, { status: results.created > 0 ? 201 : 422 });
}
