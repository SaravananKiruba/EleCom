'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Box, Text, Button, HStack, VStack, Flex, Separator, SimpleGrid, Input, Field, Textarea,
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogCloseTrigger,
} from '@chakra-ui/react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { SidePanel } from '@/components/ui/SidePanel';
import { Quote, QuoteStatus } from '@/types';
import { toaster } from '@/components/ui/toaster';
import { downloadCSV } from '@/utils/csvExport';
import { formatCurrency, formatEnum } from '@/utils/format';

const PAGE_SIZE = 10;
const STATUSES: QuoteStatus[] = ['DRAFT', 'SHARED', 'FOLLOW_UP', 'NEGOTIATION', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED_TO_SO'];

export default function AdminQuotationsPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Quote | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [convertOpen, setConvertOpen] = useState(false);
  const [customerPoNumber, setCustomerPoNumber] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [converting, setConverting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/quotes?take=500').then(r => r.json()).then(d => setQuotes(d.quotes ?? [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = quotes;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(qt =>
        qt.quoteNumber.toLowerCase().includes(q) ||
        (qt.customer?.companyName ?? '').toLowerCase().includes(q),
      );
    }
    if (statusFilter) list = list.filter(qt => qt.status === statusFilter);
    return list;
  }, [quotes, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openDetail = async (q: Quote) => {
    const full = await fetch(`/api/quotes/${q.id}`).then(r => r.ok ? r.json() : q);
    setSelected(full);
    setDetailOpen(true);
  };

  const setStatus = async (q: Quote, status: QuoteStatus, extra?: Record<string, unknown>) => {
    const res = await fetch(`/api/quotes/${q.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, ...extra }),
    });
    if (res.ok) {
      toaster.create({ title: `Quote ${formatEnum(status)}`, type: 'success', duration: 2000 });
      const updated = await res.json();
      setSelected(prev => prev ? { ...prev, ...updated } : prev);
      load();
    } else {
      toaster.create({ title: 'Update failed', type: 'error', duration: 3000 });
    }
  };

  const submitLost = async () => {
    if (!selected) return;
    await setStatus(selected, 'REJECTED', { rejectionReason: lostReason });
    setLostOpen(false);
    setLostReason('');
  };

  const openConvert = (q: Quote) => {
    setSelected(q);
    setCustomerPoNumber('');
    setBillingAddress('');
    setShippingAddress('');
    setDueDate('');
    setConvertOpen(true);
  };

  const submitConvert = async () => {
    if (!selected) return;
    setConverting(true);
    try {
      const res = await fetch('/api/sales-orders/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteId: selected.id,
          customerPoNumber: customerPoNumber || undefined,
          billingAddressSnapshot: billingAddress || undefined,
          shippingAddressSnapshot: shippingAddress || undefined,
          dueDate: dueDate || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toaster.create({ title: data.error ?? 'Conversion failed', type: 'error', duration: 4000 }); return; }
      toaster.create({ title: `Sales Order ${data.soNumber} created`, type: 'success', duration: 3000 });
      setConvertOpen(false);
      load();
    } finally {
      setConverting(false);
    }
  };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader title="Quotations" subtitle={`${quotes.length} total`}
        actions={
          <Button size="sm" variant="outline" colorPalette="green"
            onClick={() => downloadCSV(filtered.map(q => ({
              Quote: q.quoteNumber, Customer: q.customer?.companyName ?? '',
              Status: q.status, Total: Number(q.totalAmount).toFixed(2), Date: new Date(q.createdAt).toLocaleDateString(),
            })), 'quotations.csv')}>↓ Export CSV</Button>
        } />

      <Flex gap={3} mb={5} flexWrap="wrap">
        <Box flex={{ base: '1 1 100%', md: 1 }} minW={0}>
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search quotes, customer..." />
        </Box>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', minWidth: 180, fontSize: 14 }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{formatEnum(s)}</option>)}
        </select>
        {(search || statusFilter) && <Button size="md" variant="ghost" onClick={() => { setSearch(''); setStatusFilter(''); }}>Clear</Button>}
      </Flex>

      {loading ? (
        <Text color="gray.400" fontSize="sm">Loading quotations…</Text>
      ) : paginated.length === 0 ? (
        <EmptyState icon="💬" title="No quotations found" />
      ) : (
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: 800 }}>
              <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Box as="tr">
                  {['Quote #', 'RFQ #', 'Customer', 'Amount', 'Valid Until', 'Status'].map(h => (
                    <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {paginated.map(qt => (
                  <Box as="tr" key={qt.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'blue.50', cursor: 'pointer' }} onClick={() => openDetail(qt)}>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={700} color="green.700" fontFamily="mono">{qt.quoteNumber}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" fontFamily="mono" color="gray.400">{qt.rfq?.rfqNumber ?? '—'}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={600}>{qt.customer?.companyName ?? '—'}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={700}>{formatCurrency(Number(qt.totalAmount))}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" color={qt.validUntil && new Date(qt.validUntil) < new Date() ? 'red.500' : 'gray.500'}>{qt.validUntil ? new Date(qt.validUntil).toLocaleDateString() : '—'}</Text></Box>
                    <Box as="td" px={4} py={3}><StatusBadge status={qt.status} /></Box>
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
          <HStack gap={2} flexWrap="wrap">
            <Text fontWeight={800} fontFamily="mono" fontSize="sm" color="green.700">{selected.quoteNumber}</Text>
            <StatusBadge status={selected.status} />
          </HStack>
        )}>
        {selected && (
          <VStack gap={5} align="stretch">
            <SimpleGrid columns={2} gap={3}>
              <Box><Text fontSize="10px" color="gray.400">Customer</Text><Text fontSize="sm" fontWeight={600}>{selected.customer?.companyName ?? '—'}</Text></Box>
              <Box><Text fontSize="10px" color="gray.400">RFQ Ref</Text><Text fontSize="sm" fontWeight={600}>{selected.rfq?.rfqNumber ?? '—'}</Text></Box>
              <Box><Text fontSize="10px" color="gray.400">Valid Until</Text><Text fontSize="sm" fontWeight={600}>{selected.validUntil ? new Date(selected.validUntil).toLocaleDateString() : '—'}</Text></Box>
              <Box><Text fontSize="10px" color="gray.400">Created</Text><Text fontSize="sm" fontWeight={600}>{new Date(selected.createdAt).toLocaleDateString()}</Text></Box>
            </SimpleGrid>
            <Separator />
            <Box>
              <Text fontWeight={700} fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="widest">Line Items</Text>
              <VStack gap={2} align="stretch">
                {(selected.items ?? []).map((li, i) => (
                  <Flex key={i} justify="space-between" bg="gray.50" rounded="lg" px={3} py={2.5}>
                    <Box>
                      <Text fontSize="sm" fontWeight={600}>{li.productNameSnapshot ?? '—'}</Text>
                      <Text fontSize="xs" color="gray.400">Qty {String(li.quantity)} · ₹{Number(li.unitPrice).toLocaleString()} · Disc {String(li.discountPercent ?? 0)}% · Tax {String(li.taxPercent ?? 0)}%</Text>
                    </Box>
                    <Text fontSize="sm" fontWeight={700}>{formatCurrency(Number(li.lineTotal))}</Text>
                  </Flex>
                ))}
              </VStack>
              <Flex justify="flex-end" mt={3}>
                <Box bg="blue.50" p={3} rounded="xl" minW="200px">
                  <Flex justify="space-between"><Text fontSize="xs">Delivery</Text><Text fontSize="xs">{formatCurrency(Number(selected.deliveryCharges))}</Text></Flex>
                  <Flex justify="space-between"><Text fontWeight={700}>Total</Text><Text fontWeight={800} color="blue.700">{formatCurrency(Number(selected.totalAmount))}</Text></Flex>
                </Box>
              </Flex>
            </Box>
            <Separator />
            <Box>
              <Text fontWeight={700} fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="widest">Actions</Text>
              <VStack gap={2} align="stretch">
                {selected.status === 'DRAFT' && <Button colorPalette="blue" onClick={() => setStatus(selected, 'SHARED')}>Share with Customer</Button>}
                {(['SHARED', 'FOLLOW_UP', 'NEGOTIATION'] as string[]).includes(selected.status) && (
                  <>
                    <Button colorPalette="orange" variant="outline" onClick={() => setStatus(selected, 'FOLLOW_UP')}>Mark Follow-Up</Button>
                    <HStack gap={2}>
                      <Button colorPalette="green" flex={1} onClick={() => setStatus(selected, 'ACCEPTED')}>🏆 Mark Won</Button>
                      <Button colorPalette="red" variant="outline" flex={1} onClick={() => setLostOpen(true)}>✗ Mark Lost</Button>
                    </HStack>
                  </>
                )}
                {selected.status === 'ACCEPTED' && (
                  <Button colorPalette="teal" onClick={() => openConvert(selected)}>Convert to Sales Order →</Button>
                )}
                {selected.status === 'CONVERTED_TO_SO' && (
                  <Box p={3} bg="teal.50" rounded="xl" border="1px solid" borderColor="teal.200">
                    <Text fontWeight={700} color="teal.700">✅ Converted to Sales Order</Text>
                    <Link href="/admin/sales-orders"><Text fontSize="xs" color="teal.700" mt={1}>View sales orders →</Text></Link>
                  </Box>
                )}
                {selected.status === 'REJECTED' && (
                  <Box p={3} bg="red.50" rounded="xl" border="1px solid" borderColor="red.200">
                    <Text fontWeight={700} color="red.700">✗ Lost</Text>
                    {selected.rejectionReason && <Text fontSize="xs" color="red.600" mt={1}>Reason: {selected.rejectionReason}</Text>}
                  </Box>
                )}
              </VStack>
            </Box>
            {selected.termsAndConditions && (
              <Box bg="gray.50" rounded="xl" p={3}>
                <Text fontSize="10px" color="gray.400" fontWeight={600} mb={1}>TERMS</Text>
                <Text fontSize="xs" color="gray.600" whiteSpace="pre-line">{selected.termsAndConditions}</Text>
              </Box>
            )}
          </VStack>
        )}
      </SidePanel>

      <DialogRoot open={lostOpen} onOpenChange={d => setLostOpen(d.open)}>
        <DialogBackdrop />
        <DialogContent maxW={{ base: '95vw', md: '520px' }} mx="auto">
          <DialogHeader><Text fontWeight={700}>Mark Quote as Lost</Text><DialogCloseTrigger /></DialogHeader>
          <DialogBody>
            <Field.Root>
              <Field.Label fontSize="sm" fontWeight={600}>Reason</Field.Label>
              <Textarea value={lostReason} onChange={e => setLostReason(e.target.value)} rows={3} placeholder="Optional" />
            </Field.Root>
          </DialogBody>
          <DialogFooter gap={3}>
            <Button variant="ghost" onClick={() => setLostOpen(false)}>Cancel</Button>
            <Button colorPalette="red" onClick={submitLost}>Mark Lost</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot open={convertOpen} onOpenChange={d => setConvertOpen(d.open)}>
        <DialogBackdrop />
        <DialogContent maxW={{ base: '95vw', md: '580px' }} mx="auto">
          <DialogHeader><Text fontWeight={700}>Convert to Sales Order</Text><DialogCloseTrigger /></DialogHeader>
          <DialogBody>
            <VStack gap={4} align="stretch">
              <Field.Root><Field.Label fontSize="sm">Customer PO Number</Field.Label>
                <Input value={customerPoNumber} onChange={e => setCustomerPoNumber(e.target.value)} placeholder="Optional" />
              </Field.Root>
              <Field.Root><Field.Label fontSize="sm">Due Date</Field.Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </Field.Root>
              <Field.Root><Field.Label fontSize="sm">Billing Address</Field.Label>
                <Textarea rows={2} value={billingAddress} onChange={e => setBillingAddress(e.target.value)} />
              </Field.Root>
              <Field.Root><Field.Label fontSize="sm">Shipping Address</Field.Label>
                <Textarea rows={2} value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} />
              </Field.Root>
            </VStack>
          </DialogBody>
          <DialogFooter gap={3}>
            <Button variant="ghost" onClick={() => setConvertOpen(false)}>Cancel</Button>
            <Button colorPalette="teal" onClick={submitConvert} loading={converting}>Create Sales Order</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
}
