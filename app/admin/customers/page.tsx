'use client';

import {
  Box, Text, Button, HStack, VStack, Flex, SimpleGrid, Input, Field,
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogCloseTrigger,
  DrawerRoot, DrawerBackdrop, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseTrigger,
  Separator, Badge,
} from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { Customer } from '@/types';
import { toaster } from '@/components/ui/toaster';

export default function CustomersPage() {
  const { state, dispatch } = useAppState();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    if (!search) return state.customers;
    const q = search.toLowerCase();
    return state.customers.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.companyName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  }, [state.customers, search]);

  const customerRFQs = (id: string) => state.rfqs.filter(r => r.customerId === id);
  const customerQuotes = (id: string) => state.quotes.filter(q => q.customerId === id);

  const toggleStatus = (c: Customer) => {
    setPendingToggle(c);
    setConfirmOpen(true);
  };

  const confirmToggle = () => {
    if (!pendingToggle) return;
    const updated = { ...pendingToggle, status: pendingToggle.status === 'Active' ? 'Inactive' as const : 'Active' as const };
    dispatch({ type: 'UPDATE_CUSTOMER', payload: updated });
    if (selected?.id === updated.id) setSelected(updated);
    toaster.create({ title: `Customer ${updated.status === 'Active' ? 'activated' : 'deactivated'}`, type: 'success', duration: 2000 });
    setConfirmOpen(false);
  };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader title="Customers" subtitle={`${state.customers.length} total`} />

      <Box mb={5} maxW="400px">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, company, city..." />
      </Box>

      {filtered.length === 0 ? (
        <EmptyState icon="👥" title="No customers found" />
      ) : (
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: '700px' }}>
              <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Box as="tr">
                  {['Customer', 'Company', 'Mobile', 'City', 'RFQs', 'Quotes', 'Status', 'Actions'].map(h => (
                    <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide" whiteSpace="nowrap">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {filtered.map(c => (
                  <Box as="tr" key={c.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'gray.50' }}>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={600}>{c.name}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" color="gray.600">{c.companyName}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" fontFamily="mono" color="gray.600">{c.mobile}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" color="gray.600">{c.city}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={600}>{customerRFQs(c.id).length}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={600}>{customerQuotes(c.id).length}</Text></Box>
                    <Box as="td" px={4} py={3}><StatusBadge status={c.status} /></Box>
                    <Box as="td" px={4} py={3}>
                      <HStack gap={2}>
                        <Button size="xs" variant="outline" colorPalette="blue" onClick={() => { setSelected(c); setDetailOpen(true); }}>View</Button>
                        <Button size="xs" variant="outline" colorPalette={c.status === 'Active' ? 'red' : 'green'} onClick={() => toggleStatus(c)}>
                          {c.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </HStack>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Detail Drawer */}
      <DrawerRoot open={detailOpen} onOpenChange={d => setDetailOpen(d.open)} placement="end" size="md">
        <DrawerBackdrop />
        <DrawerContent maxW={{ base: '100vw', md: '480px' }}>
          <DrawerHeader borderBottom="1px solid" borderColor="gray.100">
            <Text fontWeight={700}>{selected?.name}</Text>
            <DrawerCloseTrigger />
          </DrawerHeader>
          <DrawerBody py={4}>
            {selected && (
              <VStack gap={5} align="stretch">
                <Box>
                  <Text fontWeight={700} fontSize="sm" color="gray.600" mb={2} textTransform="uppercase" letterSpacing="wide">Profile</Text>
                  <SimpleGrid columns={2} gap={3}>
                    {[['Name', selected.name], ['Company', selected.companyName], ['Mobile', selected.mobile], ['Email', selected.email], ['City', selected.city], ['GST', selected.gst || '—'], ['Since', selected.createdAt]].map(([l, v]) => (
                      <Box key={l}><Text fontSize="xs" color="gray.500">{l}</Text><Text fontSize="sm" fontWeight={600}>{v}</Text></Box>
                    ))}
                  </SimpleGrid>
                </Box>
                <Separator />
                <Box>
                  <Text fontWeight={700} fontSize="sm" color="gray.600" mb={2}>RFQs ({customerRFQs(selected.id).length})</Text>
                  {customerRFQs(selected.id).map(r => (
                    <Flex key={r.id} justify="space-between" py={2} borderBottom="1px solid" borderColor="gray.50">
                      <Text fontSize="xs" fontFamily="mono" color="blue.700">{r.rfqNumber}</Text>
                      <StatusBadge status={r.status} />
                    </Flex>
                  ))}
                </Box>
                <Box>
                  <Text fontWeight={700} fontSize="sm" color="gray.600" mb={2}>Quotes ({customerQuotes(selected.id).length})</Text>
                  {customerQuotes(selected.id).map(q => (
                    <Flex key={q.id} justify="space-between" py={2} borderBottom="1px solid" borderColor="gray.50">
                      <Text fontSize="xs" fontFamily="mono" color="green.700">{q.quoteNumber}</Text>
                      <StatusBadge status={q.status} />
                    </Flex>
                  ))}
                </Box>
                <Button colorPalette={selected.status === 'Active' ? 'red' : 'green'} variant="outline" onClick={() => { toggleStatus(selected); setDetailOpen(false); }}>
                  {selected.status === 'Active' ? 'Deactivate Customer' : 'Activate Customer'}
                </Button>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>

      {/* Confirm Dialog */}
      <DialogRoot open={confirmOpen} onOpenChange={d => setConfirmOpen(d.open)}>
        <DialogBackdrop />
        <DialogContent maxW={{ base: '95vw', md: '520px' }} mx="auto">
          <DialogHeader>
            <Text fontWeight={700}>{pendingToggle?.status === 'Active' ? 'Deactivate' : 'Activate'} Customer</Text>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <Text fontSize="sm" color="gray.600">
              Are you sure you want to {pendingToggle?.status === 'Active' ? 'deactivate' : 'activate'} <strong>{pendingToggle?.name}</strong>?
            </Text>
          </DialogBody>
          <DialogFooter gap={3}>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button colorPalette={pendingToggle?.status === 'Active' ? 'red' : 'green'} onClick={confirmToggle}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
}
