'use client';

import {
  Box, Text, Button, HStack, VStack, Flex, Badge,
  Separator, SimpleGrid,
} from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { SidePanel } from '@/components/ui/SidePanel';
import { products, brands } from '@/data/mockData';
import { RFQ, RFQStatus, Quote } from '@/types';
import { toaster } from '@/components/ui/toaster';

const STATUSES: RFQStatus[] = ['New', 'Under Review', 'Quote Ready', 'Follow-Up', 'Accepted', 'Rejected', 'Expired'];
const PAGE_SIZE = 10;
const SALESPEOPLE = ['Arjun Sales', 'Preethi CRM', 'Vikram Sales'];

export default function AdminRFQsPage() {
  const { state, dispatch } = useAppState();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [assignee, setAssignee] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');

  const filtered = useMemo(() => {
    let list = [...state.rfqs];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(r =>
        r.rfqNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.companyName.toLowerCase().includes(q) ||
        r.projectName.toLowerCase().includes(q)
      );
    }
    if (statusFilter) list = list.filter(r => r.status === statusFilter);
    return list;
  }, [state.rfqs, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openDetail = (rfq: RFQ) => {
    setSelectedRFQ(rfq);
    setAssignee(rfq.assignedTo || '');
    setDetailOpen(true);
  };

  const updateStatus = (rfq: RFQ, status: RFQStatus, note?: string) => {
    const updated: RFQ = {
      ...rfq,
      status,
      assignedTo: assignee || rfq.assignedTo,
      timeline: [
        ...rfq.timeline,
        { date: '2026-08-22', action: `Status: ${status}`, by: 'Admin', note },
      ],
    };
    dispatch({ type: 'UPDATE_RFQ', payload: updated });
    setSelectedRFQ(updated);
    toaster.create({ title: `RFQ marked as "${status}"`, type: 'success', duration: 2000 });
  };

  const createQuote = (rfq: RFQ) => {
    const quoteNumber = `QTE-2026-${Math.floor(200000 + Math.random() * 99999)}`;
    const newQuote: Quote = {
      id: `qte-${Date.now()}`,
      tenantId: user.tenantId ?? 'tenant-1',
      quoteNumber,
      rfqId: rfq.id,
      rfqNumber: rfq.rfqNumber,
      customerId: rfq.customerId,
      customerName: rfq.customerName,
      companyName: rfq.companyName,
      projectName: rfq.projectName,
      lineItems: rfq.items.map(i => ({ productId: i.productId, quantity: i.quantity, basePrice: 1000, discount: 5, tax: 18 })),
      deliveryCharges: 2500,
      terms: 'Payment within 30 days. Delivery 15 working days from SO.',
      validUntil: '2026-09-22',
      status: 'Shared',
      createdAt: '2026-08-22',
      sharedAt: '2026-08-22',
      assignedTo: rfq.assignedTo,
    };
    dispatch({ type: 'ADD_QUOTE', payload: newQuote });
    updateStatus(rfq, 'Quote Ready', 'Quote created and shared');
    toaster.create({ title: `Quote ${quoteNumber} created & shared!`, description: 'Customer will receive it within 10 minutes.', type: 'success', duration: 3000 });
  };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader title="RFQ Management" subtitle={`${state.rfqs.length} total requests`} />

      {/* Filters */}
      <Flex gap={3} mb={5} flexWrap="wrap">
        <Box flex={{ base: '1 1 100%', md: 1 }} minW={0}>
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search RFQ, customer, project..." />
        </Box>
        <Box flexShrink={0}>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '14px', color: '#374151', cursor: 'pointer', minWidth: '140px' }}
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Box>
        {(search || statusFilter) && (
          <Button size="md" variant="ghost" colorPalette="gray" onClick={() => { setSearch(''); setStatusFilter(''); }}>Clear</Button>
        )}
      </Flex>

      {/* Table */}
      {paginated.length === 0 ? (
        <EmptyState icon="📋" title="No RFQs found" description="Try adjusting your search filters." />
      ) : (
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: '700px' }}>
              <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Box as="tr">
                  {['RFQ Number', 'Customer', 'Project', 'Items', 'Date', 'Assigned', 'Status'].map(h => (
                    <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide" whiteSpace="nowrap">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {paginated.map(rfq => (
                  <Box
                    as="tr" key={rfq.id}
                    borderTop="1px solid" borderColor="gray.50"
                    _hover={{ bg: 'blue.50', cursor: 'pointer' }}
                    transition="background 0.1s"
                    onClick={() => openDetail(rfq)}
                  >
                    <Box as="td" px={4} py={3}>
                      <Text fontSize="sm" fontWeight={700} color="blue.700" fontFamily="mono">{rfq.rfqNumber}</Text>
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <Text fontSize="sm" fontWeight={600} color="gray.800">{rfq.customerName}</Text>
                      <Text fontSize="xs" color="gray.400">{rfq.companyName}</Text>
                    </Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" color="gray.700">{rfq.projectName}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={600} color="gray.600">{rfq.items.length}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.500">{rfq.createdAt}</Text></Box>
                    <Box as="td" px={4} py={3}>
                      {rfq.assignedTo
                        ? <Text fontSize="xs" color="gray.700">{rfq.assignedTo}</Text>
                        : <Text fontSize="xs" color="gray.300">Unassigned</Text>}
                    </Box>
                    <Box as="td" px={4} py={3}><StatusBadge status={rfq.status} /></Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      <SidePanel
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={
          selectedRFQ && (
            <HStack gap={2} flexWrap="wrap">
              <Text fontWeight={800} fontFamily="mono" fontSize="sm" color="blue.700">{selectedRFQ.rfqNumber}</Text>
              <StatusBadge status={selectedRFQ.status} />
            </HStack>
          )
        }
      >
        {selectedRFQ && (
          <VStack gap={5} align="stretch">
            {/* Customer */}
            <Box>
              <Text fontWeight={700} fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="widest">Customer</Text>
              <SimpleGrid columns={2} gap={3}>
                {[['Name', selectedRFQ.customerName], ['Company', selectedRFQ.companyName], ['Mobile', selectedRFQ.mobile], ['Email', selectedRFQ.email]].map(([l, v]) => (
                  <Box key={l}><Text fontSize="10px" color="gray.400" mb={0.5}>{l}</Text><Text fontSize="sm" fontWeight={600} color="gray.800">{v}</Text></Box>
                ))}
              </SimpleGrid>
            </Box>
            <Separator />
            {/* Project */}
            <Box>
              <Text fontWeight={700} fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="widest">Project</Text>
              <SimpleGrid columns={2} gap={3}>
                {[['Project', selectedRFQ.projectName], ['Location', selectedRFQ.deliveryLocation], ['Required By', selectedRFQ.requiredDeliveryDate || '—'], ['Remarks', selectedRFQ.remarks || '—']].map(([l, v]) => (
                  <Box key={l}><Text fontSize="10px" color="gray.400" mb={0.5}>{l}</Text><Text fontSize="sm" fontWeight={600} color="gray.800">{v}</Text></Box>
                ))}
              </SimpleGrid>
            </Box>
            <Separator />
            {/* Products */}
            <Box>
              <Text fontWeight={700} fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="widest">Products ({selectedRFQ.items.length})</Text>
              <VStack gap={2} align="stretch">
                {selectedRFQ.items.map(item => {
                  const p = products.find(x => x.id === item.productId);
                  const b = brands.find(x => x.id === p?.brandId);
                  return (
                    <Flex key={item.productId} justify="space-between" align="center" bg="gray.50" rounded="lg" px={3} py={2.5} gap={2}>
                      <Box minW={0}>
                        <Text fontSize="sm" fontWeight={600} color="gray.800" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">{p?.name}</Text>
                        <Text fontSize="xs" color="gray.400">{b?.name} · {p?.sku}</Text>
                      </Box>
                      <Box bg="blue.600" color="white" rounded="md" px={2} py={0.5} flexShrink={0}>
                        <Text fontSize="xs" fontWeight={700}>×{item.quantity}</Text>
                      </Box>
                    </Flex>
                  );
                })}
              </VStack>
            </Box>
            <Separator />
            {/* Assign */}
            <Box>
              <Text fontWeight={700} fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="widest">Assign Salesperson</Text>
              <HStack gap={2}>
                <select
                  value={assignee}
                  onChange={e => setAssignee(e.target.value)}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '14px', outline: 'none' }}
                >
                  <option value="">Select…</option>
                  {SALESPEOPLE.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <Button size="sm" colorPalette="blue" onClick={() => {
                  if (!assignee) return;
                  const updated = { ...selectedRFQ, assignedTo: assignee };
                  dispatch({ type: 'UPDATE_RFQ', payload: updated });
                  setSelectedRFQ(updated);
                  toaster.create({ title: `Assigned to ${assignee}`, type: 'success', duration: 2000 });
                }}>Assign</Button>
              </HStack>
            </Box>
            <Separator />
            {/* Actions */}
            <Box>
              <Text fontWeight={700} fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="widest">Actions</Text>
              <VStack gap={2} align="stretch">
                {selectedRFQ.status === 'New' && (
                  <Button colorPalette="blue" rounded="xl" onClick={() => updateStatus(selectedRFQ, 'Under Review')}>Mark Under Review</Button>
                )}
                {selectedRFQ.status !== 'Quote Ready' && selectedRFQ.status !== 'Accepted' && (
                  <Button colorPalette="green" rounded="xl" onClick={() => createQuote(selectedRFQ)}>⚡ Create & Share Quote (10 min)</Button>
                )}
                {!['Rejected', 'Expired', 'Accepted'].includes(selectedRFQ.status) && (
                  <Button colorPalette="orange" variant="outline" rounded="xl" onClick={() => updateStatus(selectedRFQ, 'Follow-Up')}>Mark Follow-Up</Button>
                )}
              </VStack>
            </Box>
            <Separator />
            {/* Timeline */}
            <Box>
              <Text fontWeight={700} fontSize="xs" color="gray.400" mb={3} textTransform="uppercase" letterSpacing="widest">Timeline</Text>
              <VStack gap={0} align="stretch">
                {selectedRFQ.timeline.map((t, i) => (
                  <HStack key={i} gap={3} align="flex-start" pb={3}>
                    <Box flexShrink={0} w={2} h={2} rounded="full" bg="blue.400" mt={1.5} />
                    <Box>
                      <Text fontSize="xs" fontWeight={600} color="gray.700">{t.action}</Text>
                      <Text fontSize="xs" color="gray.400">{t.date} · {t.by}{t.note ? ` — ${t.note}` : ''}</Text>
                    </Box>
                  </HStack>
                ))}
              </VStack>
            </Box>
          </VStack>
        )}
      </SidePanel>
    </Box>
  );
}
