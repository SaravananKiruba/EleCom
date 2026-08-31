'use client';

import { useEffect, useState } from 'react';
import { Box, Text, Button, HStack, Flex, Field, Input, Textarea, VStack, SimpleGrid,
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogCloseTrigger,
} from '@chakra-ui/react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { FollowUp, FollowUpMethod, FollowUpStatus, Quote, Customer } from '@/types';
import { toaster } from '@/components/ui/toaster';
import { formatEnum, isOverdue } from '@/utils/format';

const METHODS: FollowUpMethod[] = ['PHONE', 'EMAIL', 'WHATSAPP', 'MEETING', 'OTHER'];

export default function FollowUpsPage() {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    quoteId: '', customerId: '', method: 'PHONE' as FollowUpMethod, subject: '', notes: '', nextFollowUpAt: '',
  });

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/follow-ups?take=500').then(r => r.json()),
      fetch('/api/quotes?take=500').then(r => r.json()),
      fetch('/api/customers?take=500').then(r => r.json()),
    ]).then(([fu, q, cu]) => {
      setItems(fu.followUps ?? []);
      setQuotes(q.quotes ?? []);
      setCustomers(cu.customers ?? []);
    }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.quoteId || !form.customerId) {
      toaster.create({ title: 'Quote and Customer are required', type: 'error', duration: 3000 });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toaster.create({ title: 'Follow-up scheduled', type: 'success', duration: 2000 });
        setModalOpen(false);
        setForm({ quoteId: '', customerId: '', method: 'PHONE', subject: '', notes: '', nextFollowUpAt: '' });
        load();
      } else {
        const data = await res.json();
        toaster.create({ title: data.error ?? 'Failed', type: 'error', duration: 3000 });
      }
    } finally {
      setSaving(false);
    }
  };

  const markStatus = async (fu: FollowUp, status: FollowUpStatus) => {
    const res = await fetch('/api/follow-ups', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: fu.id, status }),
    });
    if (res.ok) {
      toaster.create({ title: `Follow-up ${formatEnum(status)}`, type: 'success', duration: 2000 });
      load();
    }
  };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader title="Follow-ups" subtitle={`${items.length} total`}
        actions={<Button colorPalette="blue" size="sm" onClick={() => setModalOpen(true)}>+ Schedule Follow-up</Button>} />

      {loading ? (
        <Text color="gray.400" fontSize="sm">Loading follow-ups…</Text>
      ) : items.length === 0 ? (
        <EmptyState icon="📅" title="No follow-ups" action={<Button size="sm" colorPalette="blue" onClick={() => setModalOpen(true)}>Schedule first</Button>} />
      ) : (
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: 800 }}>
              <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Box as="tr">
                  {['Quote', 'Customer', 'Method', 'Subject', 'Next Follow-up', 'Status', 'Actions'].map(h => (
                    <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {items.map(fu => (
                  <Box as="tr" key={fu.id} borderTop="1px solid" borderColor="gray.50">
                    <Box as="td" px={4} py={3}><Text fontSize="xs" fontFamily="mono" color="green.700">{fu.quote?.quoteNumber ?? '—'}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={600}>{fu.customer?.companyName ?? '—'}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs">{formatEnum(fu.method)}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm">{fu.subject ?? '—'}</Text></Box>
                    <Box as="td" px={4} py={3}>
                      <Text fontSize="xs" color={fu.status === 'OPEN' && isOverdue(fu.nextFollowUpAt ?? undefined) ? 'red.500' : 'gray.500'}>
                        {fu.nextFollowUpAt ? new Date(fu.nextFollowUpAt).toLocaleDateString() : '—'}
                      </Text>
                    </Box>
                    <Box as="td" px={4} py={3}><StatusBadge status={fu.status} /></Box>
                    <Box as="td" px={4} py={3}>
                      {fu.status === 'OPEN' && (
                        <HStack gap={1}>
                          <Button size="xs" colorPalette="green" onClick={() => markStatus(fu, 'COMPLETED')}>Complete</Button>
                          <Button size="xs" variant="ghost" onClick={() => markStatus(fu, 'CANCELLED')}>Cancel</Button>
                        </HStack>
                      )}
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
        <DialogContent maxW={{ base: '95vw', md: '520px' }} mx="auto">
          <DialogHeader><Text fontWeight={700}>Schedule Follow-up</Text><DialogCloseTrigger /></DialogHeader>
          <DialogBody>
            <VStack gap={4} align="stretch">
              <Field.Root><Field.Label>Quote *</Field.Label>
                <select value={form.quoteId}
                  onChange={e => {
                    const q = quotes.find(x => x.id === e.target.value);
                    setForm(p => ({ ...p, quoteId: e.target.value, customerId: q?.customerId ?? p.customerId }));
                  }}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }}>
                  <option value="">Select a quote…</option>
                  {quotes.map(q => <option key={q.id} value={q.id}>{q.quoteNumber} — {q.customer?.companyName ?? ''}</option>)}
                </select>
              </Field.Root>
              <Field.Root><Field.Label>Customer *</Field.Label>
                <select value={form.customerId}
                  onChange={e => setForm(p => ({ ...p, customerId: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }}>
                  <option value="">Select a customer…</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                </select>
              </Field.Root>
              <SimpleGrid columns={2} gap={3}>
                <Field.Root><Field.Label>Method</Field.Label>
                  <select value={form.method}
                    onChange={e => setForm(p => ({ ...p, method: e.target.value as FollowUpMethod }))}
                    style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }}>
                    {METHODS.map(m => <option key={m} value={m}>{formatEnum(m)}</option>)}
                  </select>
                </Field.Root>
                <Field.Root><Field.Label>Next Follow-up</Field.Label>
                  <Input type="date" value={form.nextFollowUpAt} onChange={e => setForm(p => ({ ...p, nextFollowUpAt: e.target.value }))} />
                </Field.Root>
              </SimpleGrid>
              <Field.Root><Field.Label>Subject</Field.Label>
                <Input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
              </Field.Root>
              <Field.Root><Field.Label>Notes</Field.Label>
                <Textarea rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </Field.Root>
            </VStack>
          </DialogBody>
          <DialogFooter gap={3}>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button colorPalette="blue" onClick={submit} loading={saving}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
}
