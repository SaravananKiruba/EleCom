'use client';

import {
  Box, Text, Button, HStack, VStack, Flex, Separator, Input, Textarea, Field, SimpleGrid,
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogCloseTrigger,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { FollowUp, FollowUpMethod, FollowUpStatus } from '@/types';
import { toaster } from '@/components/ui/toaster';

const METHODS: FollowUpMethod[] = ['WhatsApp', 'Phone', 'Email', 'Meeting', 'Other'];
const STATUSES: FollowUpStatus[] = ['Scheduled', 'Completed', 'Overdue', 'Cancelled'];

export default function FollowUpsPage() {
  const { state, dispatch } = useAppState();
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FollowUp | null>(null);
  const [form, setForm] = useState({ customerName: '', quoteNumber: '', contactPerson: '', method: 'WhatsApp' as FollowUpMethod, nextFollowUp: '', notes: '', assignedTo: '', status: 'Scheduled' as FollowUpStatus });

  const openAdd = () => {
    setEditTarget(null);
    setForm({ customerName: '', quoteNumber: '', contactPerson: '', method: 'WhatsApp', nextFollowUp: '', notes: '', assignedTo: '', status: 'Scheduled' });
    setModalOpen(true);
  };

  const openEdit = (fu: FollowUp) => {
    setEditTarget(fu);
    setForm({ customerName: fu.customerName, quoteNumber: fu.quoteNumber, contactPerson: fu.contactPerson, method: fu.method, nextFollowUp: fu.nextFollowUp, notes: fu.notes, assignedTo: fu.assignedTo, status: fu.status });
    setModalOpen(true);
  };

  const save = () => {
    if (editTarget) {
      const updated = { ...editTarget, ...form };
      dispatch({ type: 'UPDATE_FOLLOW_UP', payload: updated });
      toaster.create({ title: 'Follow-up updated', type: 'success', duration: 2000 });
    } else {
      const newFU: FollowUp = {
        id: `fu-${Date.now()}`, quoteId: '', quoteNumber: form.quoteNumber, customerId: '', customerName: form.customerName,
        contactPerson: form.contactPerson, method: form.method, lastContact: '2026-08-22', nextFollowUp: form.nextFollowUp,
        status: form.status, assignedTo: form.assignedTo, notes: form.notes,
      };
      dispatch({ type: 'ADD_FOLLOW_UP', payload: newFU });
      toaster.create({ title: 'Follow-up added', type: 'success', duration: 2000 });
    }
    setModalOpen(false);
  };

  const markComplete = (fu: FollowUp) => {
    dispatch({ type: 'UPDATE_FOLLOW_UP', payload: { ...fu, status: 'Completed' } });
    toaster.create({ title: 'Follow-up completed', type: 'success', duration: 2000 });
  };

  const s = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader
        title="Follow-ups"
        subtitle={`${state.followUps.length} total`}
        actions={<Button colorPalette="blue" size="sm" onClick={openAdd}>+ Add Follow-up</Button>}
      />

      {state.followUps.length === 0 ? (
        <EmptyState icon="📅" title="No follow-ups" action={<Button colorPalette="blue" size="sm" onClick={openAdd}>Add Follow-up</Button>} />
      ) : (
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: '700px' }}>
              <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Box as="tr">
                  {['Quote', 'Customer', 'Contact', 'Method', 'Last Contact', 'Next Follow-up', 'Status', 'Assigned', 'Actions'].map(h => (
                    <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide" whiteSpace="nowrap">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {state.followUps.map(fu => (
                  <Box as="tr" key={fu.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'gray.50' }}>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" fontFamily="mono" color="green.700" fontWeight={700}>{fu.quoteNumber}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={600}>{fu.customerName}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" color="gray.600">{fu.contactPerson}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.600">{fu.method}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.600">{fu.lastContact}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" fontWeight={600} color={fu.nextFollowUp <= '2026-08-22' && fu.status === 'Scheduled' ? 'red.600' : 'gray.700'}>{fu.nextFollowUp}</Text></Box>
                    <Box as="td" px={4} py={3}><StatusBadge status={fu.status} /></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.600">{fu.assignedTo}</Text></Box>
                    <Box as="td" px={4} py={3}>
                      <HStack gap={2}>
                        <Button size="xs" variant="outline" colorPalette="blue" onClick={() => openEdit(fu)}>Edit</Button>
                        {fu.status === 'Scheduled' && (
                          <Button size="xs" colorPalette="green" onClick={() => markComplete(fu)}>✓</Button>
                        )}
                      </HStack>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <DialogRoot open={modalOpen} onOpenChange={d => setModalOpen(d.open)}>
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader><Text fontWeight={700}>{editTarget ? 'Edit Follow-up' : 'Add Follow-up'}</Text><DialogCloseTrigger /></DialogHeader>
          <DialogBody>
            <VStack gap={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                <Field.Root><Field.Label fontSize="sm" fontWeight={600}>Customer Name</Field.Label><Input value={form.customerName} onChange={e => s('customerName', e.target.value)} /></Field.Root>
                <Field.Root><Field.Label fontSize="sm" fontWeight={600}>Quote Number</Field.Label><Input value={form.quoteNumber} onChange={e => s('quoteNumber', e.target.value)} placeholder="QTE-2026-..." /></Field.Root>
                <Field.Root><Field.Label fontSize="sm" fontWeight={600}>Contact Person</Field.Label><Input value={form.contactPerson} onChange={e => s('contactPerson', e.target.value)} /></Field.Root>
                <Field.Root>
                  <Field.Label fontSize="sm" fontWeight={600}>Method</Field.Label>
                  <select value={form.method} onChange={e => s('method', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
                    {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </Field.Root>
                <Field.Root><Field.Label fontSize="sm" fontWeight={600}>Next Follow-up Date</Field.Label><Input type="date" value={form.nextFollowUp} onChange={e => s('nextFollowUp', e.target.value)} /></Field.Root>
                <Field.Root>
                  <Field.Label fontSize="sm" fontWeight={600}>Status</Field.Label>
                  <select value={form.status} onChange={e => s('status', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }}>
                    {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </Field.Root>
                <Field.Root><Field.Label fontSize="sm" fontWeight={600}>Assigned To</Field.Label><Input value={form.assignedTo} onChange={e => s('assignedTo', e.target.value)} /></Field.Root>
              </SimpleGrid>
              <Field.Root><Field.Label fontSize="sm" fontWeight={600}>Notes</Field.Label><Textarea value={form.notes} onChange={e => s('notes', e.target.value)} rows={3} /></Field.Root>
            </VStack>
          </DialogBody>
          <DialogFooter gap={3}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button colorPalette="blue" onClick={save}>{editTarget ? 'Save Changes' : 'Add Follow-up'}</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
}
