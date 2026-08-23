'use client';

import {
  Box, Text, Button, HStack, VStack, Flex, Separator, SimpleGrid, Textarea, Field,
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogCloseTrigger,
  DrawerRoot, DrawerBackdrop, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseTrigger,
} from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { products, brands } from '@/data/mockData';
import { Quote, QuoteStatus, PurchaseOrder } from '@/types';
import { toaster } from '@/components/ui/toaster';

const PAGE_SIZE = 10;
const STATUSES: QuoteStatus[] = ['Draft', 'Shared', 'Follow-Up', 'Negotiation', 'Accepted', 'Rejected', 'Expired', 'Converted to SO'];
const LOST_REASONS = ['Price too high', 'Competitor', 'Requirement cancelled', 'Delivery timeline', 'Product unavailable', 'Project postponed', 'Budget issue', 'Other'];

export default function AdminQuotationsPage() {
  const { state, dispatch } = useAppState();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Quote | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [lostOpen, setLostOpen] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [lostRemarks, setLostRemarks] = useState('');

  const filtered = useMemo(() => {
    let list = [...state.quotes];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(qt =>
        qt.quoteNumber.toLowerCase().includes(q) ||
        qt.customerName.toLowerCase().includes(q) ||
        qt.projectName.toLowerCase().includes(q)
      );
    }
    if (statusFilter) list = list.filter(qt => qt.status === statusFilter);
    return list;
  }, [state.quotes, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const lineTotal = (li: Quote['lineItems'][0]) => {
    const after = li.basePrice * (1 - li.discount / 100);
    return after * (1 + li.tax / 100) * li.quantity;
  };
  const grandTotal = (q: Quote) => q.lineItems.reduce((s, li) => s + lineTotal(li), 0) + q.deliveryCharges;

  const update = (patch: Partial<Quote>, successMsg: string) => {
    const updated = { ...selected!, ...patch };
    dispatch({ type: 'UPDATE_QUOTE', payload: updated });
    setSelected(updated);
    toaster.create({ title: successMsg, type: 'success', duration: 2500 });
  };

  const shareWhatsapp = () => {
    update({ status: 'Shared', sharedAt: '2026-08-22' }, 'Quotation shared via WhatsApp');
    setWhatsappOpen(false);
  };

  const markWon = () => {
    update({ status: 'Accepted' }, 'Quote marked as Won!');
    const q = selected!;
    const soNum = `SO-2026-${Math.floor(300000 + Math.random() * 99999)}`;
    const so: PurchaseOrder = {
      id: `so-${Date.now()}`,
      poNumber: soNum, soNumber: soNum,
      quoteId: q.id, quoteNumber: q.quoteNumber, rfqNumber: q.rfqNumber,
      customerId: q.customerId, customerName: q.customerName, companyName: q.companyName,
      billingAddress: `${q.companyName}, India`, deliveryAddress: `${q.projectName}, India`,
      lineItems: q.lineItems, deliveryCharges: q.deliveryCharges,
      terms: q.terms, poDate: '2026-08-22', status: 'Active',
    };
    dispatch({ type: 'ADD_PO', payload: so });
    toaster.create({ title: `Sales Order ${soNum} created!`, type: 'success', duration: 3000 });
  };

  const markLost = () => {
    if (!lostReason) return;
    update({ status: 'Rejected', lostReason, lostRemarks }, 'Quote marked as Lost.');
    setLostOpen(false);
  };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader title="Quotations" subtitle={`${state.quotes.length} total quotes`} />

      <Flex gap={3} mb={5} flexWrap="wrap">
        <Box flex={{ base: '1 1 100%', md: 1 }} minW={0}>
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search quotes, customer..." />
        </Box>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '14px', color: '#374151', cursor: 'pointer', minWidth: '160px' }}
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || statusFilter) && (
          <Button size="md" variant="ghost" colorPalette="gray" onClick={() => { setSearch(''); setStatusFilter(''); }}>Clear</Button>
        )}
      </Flex>

      {paginated.length === 0 ? (
        <EmptyState icon="💬" title="No quotations found" />
      ) : (
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: '800px' }}>
              <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Box as="tr">
                  {['Quote #', 'RFQ #', 'Customer', 'Project', 'Amount', 'Valid Until', 'Assigned', 'Status', 'Actions'].map(h => (
                    <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide" whiteSpace="nowrap">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {paginated.map(qt => (
                  <Box as="tr" key={qt.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'gray.50' }}>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={700} color="green.700" fontFamily="mono">{qt.quoteNumber}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" fontFamily="mono" color="gray.500">{qt.rfqNumber}</Text></Box>
                    <Box as="td" px={4} py={3}>
                      <Text fontSize="sm" fontWeight={600}>{qt.customerName}</Text>
                      <Text fontSize="xs" color="gray.500">{qt.companyName}</Text>
                    </Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" color="gray.700">{qt.projectName}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={700}>&#8377;{grandTotal(qt).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" color={new Date(qt.validUntil) < new Date() ? 'red.500' : 'gray.600'}>{qt.validUntil}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.600">{qt.assignedTo || '—'}</Text></Box>
                    <Box as="td" px={4} py={3}><StatusBadge status={qt.status} /></Box>
                    <Box as="td" px={4} py={3}>
                      <Button size="xs" variant="outline" colorPalette="blue" rounded="md" onClick={() => { setSelected(qt); setDetailOpen(true); }}>View</Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* Detail Drawer — full screen on mobile */}
      <DrawerRoot open={detailOpen} onOpenChange={d => setDetailOpen(d.open)} placement="end" size="lg">
        <DrawerBackdrop />
        <DrawerContent maxW={{ base: '100vw', md: '540px' }}>
          <DrawerHeader borderBottom="1px solid" borderColor="gray.100" flexShrink={0}>
            <HStack gap={2} flexWrap="wrap">
              <Text fontWeight={800} fontFamily="mono" color="green.700">{selected?.quoteNumber}</Text>
              {selected && <StatusBadge status={selected.status} />}
            </HStack>
            <DrawerCloseTrigger />
          </DrawerHeader>
          <DrawerBody py={4} overflowY="auto">
            {selected && (
              <VStack gap={5} align="stretch">
                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
                  {[['Customer', selected.customerName], ['Company', selected.companyName], ['Project', selected.projectName], ['RFQ Ref', selected.rfqNumber], ['Valid Until', selected.validUntil], ['Assigned', selected.assignedTo || '—']].map(([l, v]) => (
                    <Box key={l}><Text fontSize="xs" color="gray.500">{l}</Text><Text fontSize="sm" fontWeight={600}>{v}</Text></Box>
                  ))}
                </SimpleGrid>
                <Separator />
                <Box>
                  <Text fontWeight={700} fontSize="sm" color="gray.600" mb={2} textTransform="uppercase" letterSpacing="wide">Products</Text>
                  <VStack gap={2} align="stretch">
                    {selected.lineItems.map(li => {
                      const p = products.find(x => x.id === li.productId);
                      const b = brands.find(x => x.id === p?.brandId);
                      return (
                        <Flex key={li.productId} justify="space-between" align="center" bg="gray.50" rounded="lg" px={3} py={2.5} gap={2} flexWrap="wrap">
                          <Box minW={0}>
                            <Text fontSize="sm" fontWeight={600}>{p?.name}</Text>
                            <Text fontSize="xs" color="gray.500">{b?.name} • Qty: {li.quantity}</Text>
                          </Box>
                          <Box textAlign="right" flexShrink={0}>
                            <Text fontSize="xs" color="gray.500">&#8377;{li.basePrice} -{li.discount}% +{li.tax}%</Text>
                            <Text fontSize="sm" fontWeight={700}>&#8377;{lineTotal(li).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
                          </Box>
                        </Flex>
                      );
                    })}
                  </VStack>
                  <Flex justify="flex-end" mt={3}>
                    <VStack align="stretch" minW="200px" gap={1} bg="blue.50" p={3} rounded="lg">
                      <Flex justify="space-between"><Text fontSize="xs" color="gray.600">Delivery</Text><Text fontSize="xs" fontWeight={600}>&#8377;{selected.deliveryCharges.toLocaleString()}</Text></Flex>
                      <Flex justify="space-between"><Text fontSize="sm" fontWeight={700}>Total</Text><Text fontSize="sm" fontWeight={800} color="blue.700">&#8377;{grandTotal(selected).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text></Flex>
                    </VStack>
                  </Flex>
                </Box>
                <Separator />
                <Box>
                  <Text fontWeight={700} fontSize="sm" color="gray.600" mb={3} textTransform="uppercase" letterSpacing="wide">Actions</Text>
                  <VStack gap={2} align="stretch">
                    {selected.status === 'Draft' && (
                      <Button colorPalette="blue" onClick={() => setWhatsappOpen(true)}>💬 Share Quote via WhatsApp</Button>
                    )}
                    {['Shared', 'Follow-Up', 'Negotiation'].includes(selected.status) && (
                      <VStack gap={2} align="stretch">
                        <Button colorPalette="blue" variant="ghost" size="sm" onClick={() => setWhatsappOpen(true)}>💬 Resend via WhatsApp</Button>
                        <HStack gap={2}>
                          <Button colorPalette="green" flex={1} onClick={markWon}>🏆 Won — Create Sales Order</Button>
                          <Button colorPalette="red" variant="outline" flex={1} onClick={() => setLostOpen(true)}>✗ Mark Lost</Button>
                        </HStack>
                      </VStack>
                    )}
                    {selected.status === 'Accepted' && (
                      <Box p={3} bg="green.50" rounded="lg" border="1px solid" borderColor="green.200">
                        <Text fontWeight={700} color="green.700">✅ Won — Sales Order Created</Text>
                      </Box>
                    )}
                    {selected.status === 'Rejected' && (
                      <Box p={3} bg="red.50" rounded="lg" border="1px solid" borderColor="red.200">
                        <Text fontWeight={700} color="red.700">✗ Lost</Text>
                        {selected.lostReason && <Text fontSize="xs" color="red.600" mt={1}>Reason: {selected.lostReason}</Text>}
                      </Box>
                    )}
                  </VStack>
                </Box>
                <Box bg="gray.50" rounded="lg" p={3}>
                  <Text fontSize="xs" fontWeight={600} color="gray.600" mb={1}>Terms</Text>
                  <Text fontSize="xs" color="gray.500">{selected.terms}</Text>
                </Box>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>

      {/* WhatsApp Dialog — responsive */}
      <DialogRoot open={whatsappOpen} onOpenChange={d => setWhatsappOpen(d.open)}>
        <DialogBackdrop />
        <DialogContent maxW={{ base: '95vw', md: '520px' }} mx="auto">
          <DialogHeader><Text fontWeight={700}>Share via WhatsApp</Text><DialogCloseTrigger /></DialogHeader>
          <DialogBody>
            {selected && (
              <>
                <Text fontSize="sm" color="gray.600" mb={3}>Message preview:</Text>
                <Box bg="green.50" rounded="lg" p={4} border="1px solid" borderColor="green.200">
                  <Text fontSize="sm" color="gray.700" whiteSpace="pre-line">
                    {`Dear ${selected.customerName},\n\nYour quotation ${selected.quoteNumber} for project "${selected.projectName}" is ready.\n\nPlease review and confirm.\n\nRef: ${selected.rfqNumber}\nValid Until: ${selected.validUntil}\n\nThank you,\nEleCom Lighting`}
                  </Text>
                </Box>
              </>
            )}
          </DialogBody>
          <DialogFooter gap={3}>
            <Button variant="ghost" onClick={() => setWhatsappOpen(false)}>Cancel</Button>
            <Button colorPalette="green" onClick={shareWhatsapp}>💬 Send via WhatsApp</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Lost Reason Dialog — responsive */}
      <DialogRoot open={lostOpen} onOpenChange={d => setLostOpen(d.open)}>
        <DialogBackdrop />
        <DialogContent maxW={{ base: '95vw', md: '480px' }} mx="auto">
          <DialogHeader><Text fontWeight={700}>Mark as Lost</Text><DialogCloseTrigger /></DialogHeader>
          <DialogBody>
            <Field.Root mb={4}>
              <Field.Label fontSize="sm" fontWeight={600}>Reason <Text as="span" color="red.500">*</Text></Field.Label>
              <select value={lostReason} onChange={e => setLostReason(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
                <option value="">Select reason…</option>
                {LOST_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field.Root>
            <Field.Root>
              <Field.Label fontSize="sm" fontWeight={600}>Remarks</Field.Label>
              <Textarea value={lostRemarks} onChange={e => setLostRemarks(e.target.value)} placeholder="Additional notes..." rows={3} />
            </Field.Root>
          </DialogBody>
          <DialogFooter gap={3}>
            <Button variant="ghost" onClick={() => setLostOpen(false)}>Cancel</Button>
            <Button colorPalette="red" onClick={markLost} disabled={!lostReason}>Mark as Lost</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
}
