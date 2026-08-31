'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAppState } from '@/context/AppContext';
import { products as allProducts } from '@/data/mockData';

export default function QuotePrintPage() {
  const params = useParams();
  const id = params?.id as string;
  const { state } = useAppState();
  const quote = state.quotes.find(q => q.id === id);

  useEffect(() => { if (quote) setTimeout(() => window.print(), 400); }, [quote]);

  if (!quote) return <p>Quote not found</p>;

  const lineTotal = (li: typeof quote.lineItems[0]) => {
    const after = li.basePrice * (1 - li.discount / 100);
    return after * (1 + li.tax / 100) * li.quantity;
  };
  const subtotal = quote.lineItems.reduce((s, li) => s + li.basePrice * li.quantity, 0);
  const discount = quote.lineItems.reduce((s, li) => s + li.basePrice * li.quantity * (li.discount / 100), 0);
  const tax = quote.lineItems.reduce((s, li) => s + li.basePrice * li.quantity * (1 - li.discount / 100) * (li.tax / 100), 0);
  const grand = subtotal - discount + tax + quote.deliveryCharges;
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div style={{ fontFamily: 'sans-serif', fontSize: '12px', color: '#111', padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <style>{`@media print { .no-print { display: none !important; } body { margin: 0; } }`}</style>

      {/* No-print close button */}
      <div className="no-print" style={{ marginBottom: '16px' }}>
        <button onClick={() => window.print()} style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginRight: '8px' }}>🖨 Print / Save PDF</button>
        <button onClick={() => window.close()} style={{ padding: '8px 16px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '2px solid #111', paddingBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#1a365d' }}>CVS LIGHTING</div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>Quality Lighting Solutions</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>QUOTATION</div>
          <div style={{ fontWeight: 600, color: '#2563eb' }}>{quote.quoteNumber}</div>
          <div style={{ color: '#6b7280' }}>Date: {new Date(quote.createdAt).toLocaleDateString('en-IN')}</div>
          <div style={{ color: '#6b7280' }}>Valid Until: {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString('en-IN') : '—'}</div>
        </div>
      </div>

      {/* Bill To */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontWeight: 700, fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>Bill To</div>
        <div style={{ fontWeight: 700 }}>{quote.companyName}</div>
        <div>{quote.customerName}</div>
        <div style={{ color: '#6b7280' }}>Project: {quote.projectName}</div>
      </div>

      {/* Line Items */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
        <thead>
          <tr style={{ background: '#1a365d', color: 'white' }}>
            {['#', 'Product / SKU', 'Qty', 'Unit Price', 'Disc%', 'Tax%', 'Total'].map(h => (
              <th key={h} style={{ padding: '8px', textAlign: h === '#' || h === 'Qty' || h === 'Disc%' || h === 'Tax%' ? 'center' : h === 'Unit Price' || h === 'Total' ? 'right' : 'left', fontSize: '11px', fontWeight: 700 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {quote.lineItems.map((li, i) => {
            const prod = allProducts.find(p => p.id === li.productId);
            return (
              <tr key={i} style={{ background: i % 2 === 0 ? '#f9fafb' : 'white' }}>
                <td style={{ padding: '7px 8px', textAlign: 'center' }}>{i + 1}</td>
                <td style={{ padding: '7px 8px' }}>
                  <div style={{ fontWeight: 600 }}>{prod?.name ?? li.productId}</div>
                  {prod?.sku && <div style={{ fontSize: '10px', color: '#6b7280' }}>{prod.sku}</div>}
                </td>
                <td style={{ padding: '7px 8px', textAlign: 'center' }}>{li.quantity}</td>
                <td style={{ padding: '7px 8px', textAlign: 'right' }}>{fmt(li.basePrice)}</td>
                <td style={{ padding: '7px 8px', textAlign: 'center' }}>{li.discount}%</td>
                <td style={{ padding: '7px 8px', textAlign: 'center' }}>{li.tax}%</td>
                <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 600 }}>{fmt(lineTotal(li))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <table style={{ width: '260px' }}>
          <tbody>
            {[
              { label: 'Subtotal', value: fmt(subtotal) },
              { label: 'Discount', value: `- ${fmt(discount)}` },
              { label: 'Tax', value: fmt(tax) },
              { label: 'Delivery', value: fmt(quote.deliveryCharges) },
            ].map(r => (
              <tr key={r.label}>
                <td style={{ padding: '3px 8px', color: '#6b7280' }}>{r.label}</td>
                <td style={{ padding: '3px 8px', textAlign: 'right' }}>{r.value}</td>
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid #111' }}>
              <td style={{ padding: '6px 8px', fontWeight: 800, fontSize: '14px' }}>TOTAL</td>
              <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800, fontSize: '14px', color: '#1a365d' }}>{fmt(grand)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Terms */}
      {quote.terms && (
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '4px' }}>Terms & Conditions</div>
          <div style={{ color: '#374151', fontSize: '11px', whiteSpace: 'pre-line' }}>{quote.terms}</div>
        </div>
      )}

      <div style={{ marginTop: '24px', fontSize: '11px', color: '#9ca3af', textAlign: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
        This quotation is computer generated. For queries, contact your sales representative.
      </div>
    </div>
  );
}
