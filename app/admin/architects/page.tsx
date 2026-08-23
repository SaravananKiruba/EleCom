'use client';

import {
  Box, Text, Button, HStack, VStack, Flex, Separator, SimpleGrid, Input, Field,
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogCloseTrigger,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SidePanel } from '@/components/ui/SidePanel';
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
                  {['Architect', 'Firm', 'City', 'Applied', 'Discount', 'Status'].map(h => (
                    <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide" whiteSpace="nowrap">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {state.architects.map(a => (
                  <Box
                    as="tr" key={a.id}
                    borderTop="1px solid" borderColor="gray.50"
                    _hover={{ bg: 'blue.50', cursor: 'pointer' }}
                    transition="background 0.1s"
                    onClick={() => { setSelected(a); setDrawerOpen(true); }}
                  >
                    <Box as="td" px={4} py={3}>
                      <Text fontSize="sm" fontWeight={600}>{a.name}</Text>
                      <Text fontSize="xs" color="gray.400">{a.email}</Text>
                    </Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" color="gray.700">{a.firmName}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" color="gray.600">{a.city}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.400">{a.createdAt}</Text></Box>
                    <Box as="td" px={4} py={3}>
                      {a.discount ? (
                        <Text fontSize="sm" fontWeight={700} color="green.600">{a.discount}%</Text>
                      ) : <Text fontSize="xs" color="gray.300">—</Text>}
                    </Box>
                    <Box as="td" px={4} py={3}><StatusBadge status={a.status} /></Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <SidePanel
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected && <Text fontWeight={700} fontSize="sm">{selected.name} · {selected.firmName}</Text>}
      >
        {selected && (
          <VStack gap={5} align="stretch">
            <SimpleGrid columns={2} gap={3}>
              {[
                ['Firm', selected.firmName], ['Mobile', selected.mobile], ['Email', selected.email],
                ['City', selected.city], ['License #', selected.licenseNumber], ['GST', selected.gst || '—'],
                ['Specialization', selected.specialization || '—'], ['Applied', selected.createdAt],
              ].map(([l, v]) => (
                <Box key={l}><Text fontSize="10px" color="gray.400" mb={0.5}>{l}</Text><Text fontSize="sm" fontWeight={600} color="gray.800">{v}</Text></Box>
              ))}
            </SimpleGrid>
            <Separator />
            <Box>
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontWeight={700} fontSize="xs" color="gray.400" textTransform="uppercase" letterSpacing="widest">Discount</Text>
                <Button size="xs" colorPalette="blue" onClick={() => { setNewDiscount(String(selected.discount || '')); setDiscountExpiry(selected.discountExpiry || ''); setDiscountOpen(true); }}>
                  {selected.discount ? 'Edit' : 'Assign'}
                </Button>
              </Flex>
              {selected.discount ? (
                <Box bg="green.50" rounded="xl" p={3} border="1px solid" borderColor="green.100">
                  <Text fontWeight={800} color="green.700" fontSize="2xl">{selected.discount}%</Text>
                  <Text fontSize="xs" color="green.600" mt={1}>Effective: {selected.discountEffective || '—'} · Expires: {selected.discountExpiry || '—'}</Text>
                </Box>
              ) : (
                <Text fontSize="sm" color="gray.400">No discount assigned yet</Text>
              )}
              {(selected.discountHistory?.length ?? 0) > 0 && (
                <Box mt={3}>
                  <Text fontSize="10px" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="widest">History</Text>
                  {selected.discountHistory.map((h, i) => (
                    <Box key={i} bg="gray.50" rounded="lg" p={2.5} mb={1.5}>
                      <Text fontSize="xs" color="gray.600">{h.previous}% → {h.next}% · {h.changedBy} · {h.date}</Text>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            <Separator />
            <Box>
              <Text fontWeight={700} fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="widest">Actions</Text>
              <VStack gap={2} align="stretch">
                {selected.status === 'Pending' && (
                  <HStack gap={2}>
                    <Button colorPalette="green" flex={1} rounded="xl" onClick={() => updateStatus(selected, 'Active')}>✓ Approve</Button>
                    <Button colorPalette="red" variant="outline" flex={1} rounded="xl" onClick={() => updateStatus(selected, 'Rejected')}>✗ Reject</Button>
                  </HStack>
                )}
                {selected.status === 'Active' && (
                  <Button colorPalette="orange" variant="outline" rounded="xl" onClick={() => updateStatus(selected, 'Suspended')}>Suspend</Button>
                )}
                {(selected.status === 'Suspended' || selected.status === 'Rejected') && (
                  <Button colorPalette="green" variant="outline" rounded="xl" onClick={() => updateStatus(selected, 'Active')}>Reactivate</Button>
                )}
                {selected.status === 'Approved' && (
                  <Button colorPalette="blue" rounded="xl" onClick={() => updateStatus(selected, 'Active')}>Mark Active</Button>
                )}
              </VStack>
            </Box>
          </VStack>
        )}
      </SidePanel>

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
