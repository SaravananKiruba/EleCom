'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Text, Button, HStack, VStack, Flex, Separator, SimpleGrid, Input, Field } from '@chakra-ui/react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SidePanel } from '@/components/ui/SidePanel';
import { SalesOrder, SalesOrderStatus } from '@/types';
import { toaster } from '@/components/ui/toaster';
import { downloadCSV } from '@/utils/csvExport';
import { formatCurrency, formatEnum, isOverdue } from '@/utils/format';
import { SearchInput } from '@/components/ui/SearchInput';

const STATUSES: SalesOrderStatus[] = ['ACTIVE', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];

export default function SalesOrdersPage() {
  const [sos, setSos] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<SalesOrder | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [dispatchDate, setDispatchDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/sales-orders?take=500').then(r => r.json()).then(d => setSos(d.salesOrders ?? [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = sos;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.soNumber.toLowerCase().includes(q) ||
        (s.customer?.companyName ?? '').toLowerCase().includes(q),
      );
    }
    if (statusFilter) list = list.filter(s => s.status === statusFilter);
    return list;
  }, [sos, search, statusFilter]);

  const openSO = async (so: SalesOrder) => {
    const full: SalesOrder = await fetch(`/api/sales-orders/${so.id}`).then(r => r.ok ? r.json() : so);
    setSelected(full);
    setDispatchDate(full.dispatchDate ? new Date(full.dispatchDate).toISOString().split('T')[0] : '');
    setDueDate(full.dueDate ? new Date(full.dueDate).toISOString().split('T')[0] : '');
    setTrackingId(full.trackingId ?? '');
    setDetailOpen(true);
  };

  const updateSO = async (patch: Record<string, unknown>, message: string) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/sales-orders/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        toaster.create({ title: message, type: 'success', duration: 2000 });
        const updated = await res.json();
        setSelected({ ...selected, ...updated });
        load();
      } else {
        const err = await res.json();
        toaster.create({ title: err.error ?? 'Update failed', type: 'error', duration: 3000 });
      }
    } finally {
      setSaving(false);
    }
  };

  const saveLogistics = () =>
    updateSO({
      status: selected?.status,
      dispatchDate: dispatchDate || undefined,
      trackingId: trackingId || undefined,
    }, 'Logistics updated');

  const markStatus = (status: SalesOrderStatus, extra?: Record<string, unknown>) =>
    updateSO({ status, ...extra }, `Sales Order ${formatEnum(status)}`);

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader title="Sales Orders" subtitle={`${sos.length} total`}
        actions={
          <Button size="sm" variant="outline" colorPalette="green"
            onClick={() => downloadCSV(filtered.map(s => ({
              SO: s.soNumber, Customer: s.customer?.companyName ?? '', Amount: Number(s.totalAmount).toFixed(2),
              Status: s.status, Date: new Date(s.orderDate).toLocaleDateString(),
            })), 'sales-orders.csv')}>↓ Export CSV</Button>
        } />

      <Flex gap={3} mb={5} flexWrap="wrap">
        <Box flex={{ base: '1 1 100%', md: 1 }} minW={0}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search SO, customer..." />
        </Box>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', minWidth: 160, fontSize: 14 }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{formatEnum(s)}</option>)}
        </select>
      </Flex>

      {loading ? (
        <Text color="gray.400" fontSize="sm">Loading sales orders…</Text>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🛒" title="No sales orders" description="Sales orders are created by converting an accepted quote." />
      ) : (
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: 700 }}>
              <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Box as="tr">
                  {['SO #', 'Customer', 'Amount', 'Order Date', 'Due Date', 'Tracking', 'Status'].map(h => (
                    <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {filtered.map(so => (
                  <Box as="tr" key={so.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'blue.50', cursor: 'pointer' }} onClick={() => openSO(so)}>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={700} color="blue.700" fontFamily="mono">{so.soNumber}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={600}>{so.customer?.companyName ?? '—'}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={700}>{formatCurrency(Number(so.totalAmount))}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.500">{new Date(so.orderDate).toLocaleDateString()}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" color={isOverdue(so.dueDate ?? undefined) && so.status !== 'DELIVERED' ? 'red.500' : 'gray.500'}>{so.dueDate ? new Date(so.dueDate).toLocaleDateString() : '—'}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" fontFamily="mono" color="gray.500">{so.trackingId ?? '—'}</Text></Box>
                    <Box as="td" px={4} py={3}><StatusBadge status={so.status} /></Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <SidePanel open={detailOpen} onClose={() => setDetailOpen(false)}
        title={selected && (
          <HStack gap={2}>
            <Text fontWeight={800} fontFamily="mono" fontSize="sm" color="blue.700">{selected.soNumber}</Text>
            <StatusBadge status={selected.status} />
          </HStack>
        )}>
        {selected && (
          <VStack gap={5} align="stretch">
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
              <Box><Text fontSize="10px" color="gray.400">Customer</Text><Text fontSize="sm" fontWeight={600}>{selected.customer?.companyName ?? '—'}</Text></Box>
              <Box><Text fontSize="10px" color="gray.400">Quote Ref</Text><Text fontSize="sm" fontWeight={600}>{selected.quote?.quoteNumber ?? '—'}</Text></Box>
              <Box><Text fontSize="10px" color="gray.400">Customer PO</Text><Text fontSize="sm" fontWeight={600}>{selected.customerPoNumber ?? '—'}</Text></Box>
              <Box><Text fontSize="10px" color="gray.400">Order Date</Text><Text fontSize="sm" fontWeight={600}>{new Date(selected.orderDate).toLocaleDateString()}</Text></Box>
            </SimpleGrid>

            <Box bg="blue.50" rounded="lg" p={4} border="1px solid" borderColor="blue.100">
              <Text fontWeight={700} fontSize="sm" color="blue.700" mb={3} textTransform="uppercase" letterSpacing="wide">Logistics</Text>
              <VStack gap={3} align="stretch">
                <Field.Root><Field.Label fontSize="xs">Dispatch Date</Field.Label>
                  <Input size="sm" type="date" value={dispatchDate} onChange={e => setDispatchDate(e.target.value)} bg="white" />
                </Field.Root>
                <Field.Root><Field.Label fontSize="xs">Due Date</Field.Label>
                  <Input size="sm" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} bg="white" />
                </Field.Root>
                <Field.Root><Field.Label fontSize="xs">Tracking ID</Field.Label>
                  <Input size="sm" placeholder="DTDC12345678" value={trackingId} onChange={e => setTrackingId(e.target.value)} bg="white" />
                </Field.Root>
                <Button size="sm" colorPalette="blue" onClick={saveLogistics} loading={saving}>Save Logistics</Button>
              </VStack>
            </Box>

            {selected.billingAddressSnapshot && (
              <Box><Text fontSize="xs" color="gray.500">Billing Address</Text><Text fontSize="sm" whiteSpace="pre-line">{selected.billingAddressSnapshot}</Text></Box>
            )}
            {selected.shippingAddressSnapshot && (
              <Box><Text fontSize="xs" color="gray.500">Shipping Address</Text><Text fontSize="sm" whiteSpace="pre-line">{selected.shippingAddressSnapshot}</Text></Box>
            )}

            <Separator />
            <Box>
              <Text fontWeight={700} fontSize="sm" color="gray.600" mb={2}>Products</Text>
              <VStack gap={2} align="stretch">
                {(selected.items ?? []).map((li, i) => (
                  <Flex key={i} justify="space-between" bg="gray.50" rounded="lg" px={3} py={2.5}>
                    <Box>
                      <Text fontSize="sm" fontWeight={600}>{li.productNameSnapshot ?? '—'}</Text>
                      <Text fontSize="xs" color="gray.500">Qty {String(li.quantity)} · Unit ₹{Number(li.unitPrice).toLocaleString()}</Text>
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
              <Text fontWeight={700} fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="widest">Fulfilment</Text>
              <VStack gap={2} align="stretch">
                {selected.status === 'ACTIVE' && (
                  <Button colorPalette="blue" onClick={() => markStatus('DISPATCHED', { dispatchDate: dispatchDate || new Date().toISOString(), trackingId })}>Mark Dispatched</Button>
                )}
                {selected.status === 'DISPATCHED' && (
                  <Button colorPalette="teal" onClick={() => markStatus('DELIVERED', { deliveredAt: new Date().toISOString() })}>Mark Delivered</Button>
                )}
                {selected.status !== 'CANCELLED' && selected.status !== 'DELIVERED' && (
                  <Button colorPalette="red" variant="outline" onClick={() => markStatus('CANCELLED')}>Cancel Order</Button>
                )}
              </VStack>
            </Box>
          </VStack>
        )}
      </SidePanel>
    </Box>
  );
}
