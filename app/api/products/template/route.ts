import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function GET() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Products');

  ws.columns = [
    { header: 'name', key: 'name', width: 30 },
    { header: 'sku', key: 'sku', width: 18 },
    { header: 'brandName', key: 'brandName', width: 18 },
    { header: 'categoryName', key: 'categoryName', width: 18 },
    { header: 'shortDescription', key: 'shortDescription', width: 30 },
    { header: 'description', key: 'description', width: 40 },
    { header: 'imageUrl', key: 'imageUrl', width: 40 },
    { header: 'basePrice', key: 'basePrice', width: 12 },
    { header: 'status', key: 'status', width: 12 },
    { header: 'specKeys', key: 'specKeys', width: 30 },
    { header: 'specValues', key: 'specValues', width: 30 },
  ];

  // Style header row
  ws.getRow(1).eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A365D' } };
  });

  // Example row
  ws.addRow({
    name: 'LED Panel 36W',
    sku: 'LED-PNL-36W',
    brandName: 'Philips',
    categoryName: 'LED Panels',
    shortDescription: '36W Surface Panel',
    description: 'Full description here',
    imageUrl: '',
    basePrice: 2500,
    status: 'ACTIVE',
    specKeys: 'Wattage|Color Temp|IP Rating',
    specValues: '36W|4000K|IP54',
  });

  const buffer = await wb.xlsx.writeBuffer();
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="product_import_template.xlsx"',
    },
  });
}
