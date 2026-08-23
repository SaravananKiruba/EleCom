'use client';

import {
  Box, Text, Button, HStack, VStack, Flex, Separator, SimpleGrid, Input, Textarea, Field,
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogCloseTrigger,
  DrawerRoot, DrawerBackdrop, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseTrigger,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Architect, ArchitectStatus, DiscountHistory } from '@/types';
import { toaster } from '@/components/ui/toaster';

const STATUSES: ArchitectStatus[] = ['Pending', 'Approved', 'Active', 'Rejected', 'Suspended'];

export default function ArchitectsPage() {
  const { state, dispatch } = useAppState();
  const [selected, setSelected] = useState<Architect | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [newDiscount, setNewDiscount] = useState('');
  const [discountExpiry, setDiscountExpiry] = useState('');

  const updateStatus = (arch: Architect, status: ArchitectStatus) => {
    const updated = { ...arch, status };
    dispatch({ type: 'UPDATE_ARCHITECT', payload: updated });
    if (selected?.id === arch.id) setSelected(updated);
    toaster.create({ title: `Architect ${status}`, type: 'success', duration: 2000 });
  };

  const saveDiscount = () => {
    if (!selected || !newDiscount) return;
    const history: DiscountHistory = {
      previous: selected.discount || 0,
      next: parseFloat(newDiscount),
      changedBy: 'Admin',
      date: '2026-08-22',
    };
    const updated: Architect = {
      ...selected,
      discount: parseFloat(newDiscount),
      discountExpiry,
      discountEffective: '2026-08-22',
      discountHistory: [...(selected.discountHistory || []), history],
    };
    dispatch({ type: 'UPDATE_ARCHITECT', payload: updated });
    setSelected(updated);
    setDiscountOpen(false);
    toaster.create({ title: `Discount updated to ${newDiscount}%`, type: 'success', duration: 2500 });
  };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader title="Architect Partners" subtitle={`${state.architects.length} total`} />

      {state.architects.length === 0 ? (
        <EmptyState icon="🏛️" title="No architects yet" />
      ) : (
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: '700px' }}>
              <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Box as="tr">
                  {['Architect', 'Firm', 'City', 'Applied', 'Discount', 'Status', 'Actions'].map(h => (
                    <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide" whiteSpace="nowrap">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {state.architects.map(a => (
                  <Box as="tr" key={a.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'gray.50' }}>
                    <Box as="td" px={4} py={3}>
                      <Text fontSize="sm" fontWeight={600}>{a.name}</Text>
                      <Text fontSize="xs" color="gray.500">{a.email}</Text>
                    </Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" color="gray.700">{a.firmName}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" color="gray.600">{a.city}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.500">{a.createdAt}</Text></Box>
                    <Box as="td" px={4} py={3}>
                      {a.discount ? (
                        <Text fontSize="sm" fontWeight={700} color="green.600">{a.discount}%</Text>
                      ) : <Text fontSize="xs" color="gray.400">—</Text>}
                    </Box>
                    <Box as="td" px={4} py={3}><StatusBadge status={a.status} /></Box>
                    <Box as="td" px={4} py={3}>
                      <Button size="xs" variant="outline" colorPalette="blue" onClick={() => { setSelected(a); setDrawerOpen(true); }}>View</Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Detail Drawer */}
      <DrawerRoot open={drawerOpen} onOpenChange={d => setDrawerOpen(d.open)} placement="end" size="md">
        <DrawerBackdrop />
        <DrawerContent maxW={{ base: '100vw', md: '480px' }}>
          <DrawerHeader borderBottom="1px solid" borderColor="gray.100">
            <Text fontWeight={700}>{selected?.name}</Text>
            <DrawerCloseTrigger />
          </DrawerHeader>
          <DrawerBody py={4} overflowY="auto">
            {selected && (
              <VStack gap={5} align="stretch">
                <Box>
                  <Text fontWeight={700} fontSize="sm" color="gray.600" mb={2} textTransform="uppercase" letterSpacing="wide">Profile</Text>
                  <SimpleGrid columns={2} gap={3}>
                    {[
                      ['Firm', selected.firmName], ['Mobile', selected.mobile], ['Email', selected.email],
                      ['City', selected.city], ['License #', selected.licenseNumber], ['GST', selected.gst || '—'],
                      ['Specialization', selected.specialization || '—'], ['Applied', selected.createdAt],
                    ].map(([l, v]) => (
                      <Box key={l}><Text fontSize="xs" color="gray.500">{l}</Text><Text fontSize="sm" fontWeight={600}>{v}</Text></Box>
                    ))}
                  </SimpleGrid>
                </Box>
                <Separator />
                {/* Discount */}
                <Box>
                  <Flex justify="space-between" align="center" mb={2}>
                    <Text fontWeight={700} fontSize="sm" color="gray.600" textTransform="uppercase" letterSpacing="wide">Discount</Text>
                    <Button size="xs" colorPalette="blue" onClick={() => { setNewDiscount(String(selected.discount || '')); setDiscountExpiry(selected.discountExpiry || ''); setDiscountOpen(true); }}>
                      {selected.discount ? 'Edit' : 'Assign'}
                    </Button>
                  </Flex>
                  {selected.discount ? (
                    <Box bg="green.50" rounded="lg" p={3} border="1px solid" borderColor="green.100">
                      <Text fontWeight={700} color="green.700" fontSize="xl">{selected.discount}%</Text>
                      <Text fontSize="xs" color="green.600">Effective: {selected.discountEffective || '—'} · Expires: {selected.discountExpiry || '—'}</Text>
                    </Box>
                  ) : (
                    <Text fontSize="sm" color="gray.400">No discount assigned</Text>
                  )}
                  {selected.discountHistory?.length > 0 && (
                    <Box mt={3}>
                      <Text fontSize="xs" fontWeight={600} color="gray.600" mb={2}>Discount History</Text>
                      {selected.discountHistory.map((h, i) => (
                        <Box key={i} bg="gray.50" rounded="lg" p={2.5} mb={2}>
                          <Text fontSize="xs" color="gray.600">{h.previous}% → {h.next}% · by {h.changedBy} · {h.date}</Text>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
                <Separator />
                {/* Status actions */}
                <Box>
                  <Text fontWeight={700} fontSize="sm" color="gray.600" mb={2} textTransform="uppercase" letterSpacing="wide">Actions</Text>
                  <VStack gap={2} align="stretch">
                    {selected.status === 'Pending' && (
                      <HStack gap={2}>
                        <Button colorPalette="green" flex={1} onClick={() => updateStatus(selected, 'Active')}>✓ Approve</Button>
                        <Button colorPalette="red" variant="outline" flex={1} onClick={() => updateStatus(selected, 'Rejected')}>✗ Reject</Button>
                      </HStack>
                    )}
                    {selected.status === 'Active' && (
                      <Button colorPalette="orange" variant="outline" onClick={() => updateStatus(selected, 'Suspended')}>Suspend</Button>
                    )}
                    {(selected.status === 'Suspended' || selected.status === 'Rejected') && (
                      <Button colorPalette="green" variant="outline" onClick={() => updateStatus(selected, 'Active')}>Reactivate</Button>
                    )}
                    {selected.status === 'Approved' && (
                      <Button colorPalette="blue" onClick={() => updateStatus(selected, 'Active')}>Mark Active</Button>
                    )}
                  </VStack>
                </Box>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>

      {/* Discount Dialog */}
      <DialogRoot open={discountOpen} onOpenChange={d => setDiscountOpen(d.open)}>
        <DialogBackdrop />
        <DialogContent maxW={{ base: '95vw', md: '480px' }} mx="auto">
          <DialogHeader><Text fontWeight={700}>Assign / Edit Discount</Text><DialogCloseTrigger /></DialogHeader>
          <DialogBody>
            <VStack gap={4} align="stretch">
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Discount Percentage (%)</Field.Label>
                <Input type="number" min="0" max="50" step="0.5" value={newDiscount} onChange={e => setNewDiscount(e.target.value)} placeholder="e.g. 10" />
              </Field.Root>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Expiry Date</Field.Label>
                <Input type="date" value={discountExpiry} onChange={e => setDiscountExpiry(e.target.value)} />
              </Field.Root>
            </VStack>
          </DialogBody>
          <DialogFooter gap={3}>
            <Button variant="ghost" onClick={() => setDiscountOpen(false)}>Cancel</Button>
            <Button colorPalette="blue" onClick={saveDiscount} disabled={!newDiscount}>Save Discount</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
}
