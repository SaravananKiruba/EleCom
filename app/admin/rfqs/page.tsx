'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Text, Button, HStack, VStack, Flex, Separator, SimpleGrid, Input, Field, Textarea } from '@chakra-ui/react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { SidePanel } from '@/components/ui/SidePanel';
import { RFQ, RFQStatus } from '@/types';
import { toaster } from '@/components/ui/toaster';
import { downloadCSV } from '@/utils/csvExport';
import { formatEnum } from '@/utils/format';

const STATUSES: RFQStatus[] = ['NEW', 'UNDER_REVIEW', 'QUOTE_READY', 'FOLLOW_UP', 'ACCEPTED', 'REJECTED', 'EXPIRED'];
const PAGE_SIZE = 10;

interface QuoteLineDraft {
  productId?: string | null;
  productNameSnapshot: string;
  skuSnapshot?: string | null;
  description?: string | null;
  quantity: number;
  unit?: string | null;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
}

export default function AdminRFQsPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<RFQ | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteLines, setQuoteLines] = useState<QuoteLineDraft[]>([]);
  const [validUntil, setValidUntil] = useState('');
  const [quoteTerms, setQuoteTerms] = useState('Payment within 30 days from PO. Delivery 15 working days from SO.');
  const [deliveryCharges, setDeliveryCharges] = useState('0');
  const [savingQuote, setSavingQuote] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/rfqs?take=500').then(r => r.json()).then(d => setRfqs(d.rfqs ?? [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = rfqs;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.rfqNumber.toLowerCase().includes(q) ||
        (r.subject ?? '').toLowerCase().includes(q) ||
        (r.customer?.companyName ?? '').toLowerCase().includes(q),
      );
    }
    if (statusFilter) list = list.filter(r => r.status === statusFilter);
    return list;
  }, [rfqs, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openDetail = async (rfq: RFQ) => {
    const full = await fetch(`/api/rfqs/${rfq.id}`).then(r => r.ok ? r.json() : rfq);
    setSelected(full);
    setDetailOpen(true);
  };

  const updateStatus = async (rfq: RFQ, status: RFQStatus) => {
    const res = await fetch(`/api/rfqs/${rfq.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toaster.create({ title: `RFQ ${formatEnum(status)}`, type: 'success', duration: 2000 });
      const updated = await res.json();
      setSelected(prev => prev ? { ...prev, ...updated } : prev);
      load();
    } else {
      toaster.create({ title: 'Update failed', type: 'error', duration: 3000 });
    }
  };

  const openQuoteBuilder = (rfq: RFQ) => {
    setSelected(rfq);
    const lines: QuoteLineDraft[] = (rfq.items ?? []).map(it => ({
      productId: it.productId ?? undefined,
      productNameSnapshot: it.productNameSnapshot ?? it.product?.name ?? 'Product',
      skuSnapshot: it.skuSnapshot ?? it.product?.sku ?? '',
      description: it.description ?? undefined,
      quantity: Number(it.quantity),
      unit: it.unit ?? undefined,
      unitPrice: Number(it.product?.basePrice ?? 0),
      discountPercent: 0,
      taxPercent: 18,
    }));
    setQuoteLines(lines);
    setDeliveryCharges('0');
    const in30 = new Date();
    in30.setDate(in30.getDate() + 30);
    setValidUntil(in30.toISOString().split('T')[0]);
    setQuoteOpen(true);
  };

  const updateLine = (idx: number, patch: Partial<QuoteLineDraft>) => {
    setQuoteLines(lines => lines.map((l, i) => i === idx ? { ...l, ...patch } : l));
  };

  const quoteTotal = useMemo(() => {
    let total = 0;
    quoteLines.forEach(l => {
      const gross = l.quantity * l.unitPrice;
      const net = gross * (1 - l.discountPercent / 100);
      total += net * (1 + l.taxPercent / 100);
    });
    return total + Number(deliveryCharges || 0);
  }, [quoteLines, deliveryCharges]);

  const submitQuote = async () => {
    if (!selected) return;
    if (quoteLines.some(l => !l.quantity || l.unitPrice < 0)) {
      toaster.create({ title: 'Set quantity and unit price for every line', type: 'error', duration: 3000 });
      return;
    }
    setSavingQuote(true);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfqId: selected.id,
          customerId: selected.customerId,
          validUntil: validUntil || undefined,
          termsAndConditions: quoteTerms,
          deliveryCharges: Number(deliveryCharges || 0),
          items: quoteLines,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toaster.create({ title: data.error ?? 'Failed', type: 'error', duration: 4000 }); return; }
      toaster.create({ title: `Quote ${data.quoteNumber} created & shared`, type: 'success', duration: 3000 });
      setQuoteOpen(false);
      load();
    } finally {
      setSavingQuote(false);
    }
  };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader title="RFQ Management" subtitle={`${rfqs.length} total`}
        actions={
          <Button size="sm" variant="outline" colorPalette="green"
            onClick={() => downloadCSV(filtered.map(r => ({
              RFQ: r.rfqNumber, Customer: r.customer?.companyName ?? '', Subject: r.subject ?? '',
              Status: r.status, Date: new Date(r.createdAt).toLocaleDateString(),
            })), 'rfqs.csv')}>↓ Export CSV</Button>
        } />

      <Flex gap={3} mb={5} flexWrap="wrap">
        <Box flex={{ base: '1 1 100%', md: 1 }} minW={0}>
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search RFQ, customer, subject..." />
        </Box>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', minWidth: 160, fontSize: 14 }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{formatEnum(s)}</option>)}
        </select>
        {(search || statusFilter) && <Button size="md" variant="ghost" onClick={() => { setSearch(''); setStatusFilter(''); }}>Clear</Button>}
      </Flex>

      {loading ? (
        <Text color="gray.400" fontSize="sm">Loading RFQs…</Text>
      ) : paginated.length === 0 ? (
        <EmptyState icon="📋" title="No RFQs found" />
      ) : (
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: 700 }}>
              <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Box as="tr">
                  {['RFQ #', 'Customer', 'Subject', 'Items', 'Date', 'Status'].map(h => (
                    <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {paginated.map(rfq => (
                  <Box as="tr" key={rfq.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'blue.50', cursor: 'pointer' }} onClick={() => openDetail(rfq)}>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={700} color="blue.700" fontFamily="mono">{rfq.rfqNumber}</Text></Box>
                    <Box as="td" px={4} py={3}>
                      <Text fontSize="sm" fontWeight={600}>{rfq.customer?.companyName ?? '—'}</Text>
                      <Text fontSize="xs" color="gray.400">{rfq.customer?.email ?? ''}</Text>
                    </Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" color="gray.700">{rfq.subject ?? '—'}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={600}>{rfq.items?.length ?? 0}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.500">{new Date(rfq.createdAt).toLocaleDateString()}</Text></Box>
                    <Box as="td" px={4} py={3}><StatusBadge status={rfq.status} /></Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <SidePanel open={detailOpen} onClose={() => setDetailOpen(false)}
        title={selected && (
          <HStack gap={2}>
            <Text fontWeight={800} fontFamily="mono" fontSize="sm" color="blue.700">{selected.rfqNumber}</Text>
            <StatusBadge status={selected.status} />
          </HStack>
        )}>
        {selected && (
          <VStack gap={5} align="stretch">
            <Box>
              <Text fontWeight={700} fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="widest">Customer</Text>
              <SimpleGrid columns={2} gap={3}>
                <Box><Text fontSize="10px" color="gray.400">Company</Text><Text fontSize="sm" fontWeight={600}>{selected.customer?.companyName ?? '—'}</Text></Box>
                <Box><Text fontSize="10px" color="gray.400">Contact</Text><Text fontSize="sm" fontWeight={600}>{selected.customer?.contactPerson ?? '—'}</Text></Box>
                <Box><Text fontSize="10px" color="gray.400">Email</Text><Text fontSize="sm" fontWeight={600}>{selected.customer?.email ?? '—'}</Text></Box>
                <Box><Text fontSize="10px" color="gray.400">Phone</Text><Text fontSize="sm" fontWeight={600}>{selected.customer?.phone ?? '—'}</Text></Box>
              </SimpleGrid>
            </Box>
            <Separator />
            <Box>
              <Text fontWeight={700} fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="widest">Details</Text>
              <SimpleGrid columns={2} gap={3}>
                <Box><Text fontSize="10px" color="gray.400">Subject</Text><Text fontSize="sm" fontWeight={600}>{selected.subject ?? '—'}</Text></Box>
                <Box><Text fontSize="10px" color="gray.400">Required By</Text><Text fontSize="sm" fontWeight={600}>{selected.requestedDate ? new Date(selected.requestedDate).toLocaleDateString() : '—'}</Text></Box>
                <Box><Text fontSize="10px" color="gray.400">Source</Text><Text fontSize="sm" fontWeight={600}>{formatEnum(selected.source)}</Text></Box>
                <Box><Text fontSize="10px" color="gray.400">Notes</Text><Text fontSize="sm">{selected.notes ?? '—'}</Text></Box>
              </SimpleGrid>
            </Box>
            <Separator />
            <Box>
              <Text fontWeight={700} fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="widest">Products ({selected.items?.length ?? 0})</Text>
              <VStack gap={2} align="stretch">
                {(selected.items ?? []).map((it, i) => (
                  <Flex key={i} justify="space-between" bg="gray.50" rounded="lg" px={3} py={2.5}>
                    <Box minW={0}>
                      <Text fontSize="sm" fontWeight={600}>{it.productNameSnapshot ?? it.product?.name ?? '—'}</Text>
                      <Text fontSize="xs" color="gray.400">{it.skuSnapshot ?? it.product?.sku ?? ''}</Text>
                    </Box>
                    <Box bg="blue.600" color="white" rounded="md" px={2} py={0.5}><Text fontSize="xs" fontWeight={700}>×{String(it.quantity)}</Text></Box>
                  </Flex>
                ))}
              </VStack>
            </Box>
            <Separator />
            <Box>
              <Text fontWeight={700} fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="widest">Actions</Text>
              <VStack gap={2} align="stretch">
                {selected.status === 'NEW' && <Button colorPalette="blue" onClick={() => updateStatus(selected, 'UNDER_REVIEW')}>Mark Under Review</Button>}
                {(selected.status === 'NEW' || selected.status === 'UNDER_REVIEW') && (
                  <Button colorPalette="green" onClick={() => openQuoteBuilder(selected)}>⚡ Create &amp; Share Quote</Button>
                )}
                {!(['REJECTED', 'EXPIRED', 'ACCEPTED'] as string[]).includes(selected.status) && (
                  <Button colorPalette="orange" variant="outline" onClick={() => updateStatus(selected, 'FOLLOW_UP')}>Mark Follow-Up</Button>
                )}
                {selected.status !== 'REJECTED' && <Button colorPalette="red" variant="outline" onClick={() => updateStatus(selected, 'REJECTED')}>Reject</Button>}
              </VStack>
            </Box>
          </VStack>
        )}
      </SidePanel>

      <SidePanel open={quoteOpen} onClose={() => setQuoteOpen(false)}
        title={<Text fontWeight={700}>Create Quote — {selected?.rfqNumber}</Text>}>
        {selected && (
          <VStack gap={4} align="stretch">
            {quoteLines.map((l, i) => (
              <Box key={i} bg="gray.50" rounded="lg" p={3}>
                <Text fontSize="sm" fontWeight={600} mb={2}>{l.productNameSnapshot}</Text>
                <SimpleGrid columns={{ base: 2, md: 4 }} gap={2}>
                  <Field.Root><Field.Label fontSize="xs">Qty</Field.Label>
                    <Input size="sm" type="number" value={l.quantity} onChange={e => updateLine(i, { quantity: Number(e.target.value) })} />
                  </Field.Root>
                  <Field.Root><Field.Label fontSize="xs">Unit Price</Field.Label>
                    <Input size="sm" type="number" value={l.unitPrice} onChange={e => updateLine(i, { unitPrice: Number(e.target.value) })} />
                  </Field.Root>
                  <Field.Root><Field.Label fontSize="xs">Disc %</Field.Label>
                    <Input size="sm" type="number" value={l.discountPercent} onChange={e => updateLine(i, { discountPercent: Number(e.target.value) })} />
                  </Field.Root>
                  <Field.Root><Field.Label fontSize="xs">Tax %</Field.Label>
                    <Input size="sm" type="number" value={l.taxPercent} onChange={e => updateLine(i, { taxPercent: Number(e.target.value) })} />
                  </Field.Root>
                </SimpleGrid>
              </Box>
            ))}
            <Field.Root><Field.Label fontSize="xs">Delivery Charges</Field.Label>
              <Input size="sm" type="number" value={deliveryCharges} onChange={e => setDeliveryCharges(e.target.value)} />
            </Field.Root>
            <Field.Root><Field.Label fontSize="xs">Valid Until</Field.Label>
              <Input size="sm" type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} />
            </Field.Root>
            <Field.Root><Field.Label fontSize="xs">Terms &amp; Conditions</Field.Label>
              <Textarea size="sm" rows={3} value={quoteTerms} onChange={e => setQuoteTerms(e.target.value)} />
            </Field.Root>
            <Box bg="blue.50" rounded="xl" p={3}>
              <Flex justify="space-between"><Text fontSize="sm" fontWeight={700}>Estimated Total</Text><Text fontSize="lg" fontWeight={800}>₹{quoteTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text></Flex>
            </Box>
            <Button colorPalette="green" size="lg" onClick={submitQuote} loading={savingQuote}>⚡ Create &amp; Share Quote</Button>
          </VStack>
        )}
      </SidePanel>
    </Box>
  );
}
