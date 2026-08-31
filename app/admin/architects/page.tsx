'use client';

import { useEffect, useState } from 'react';
import { Box, Text, Button, HStack, VStack, Flex, Separator, SimpleGrid, Input, Field, Textarea } from '@chakra-ui/react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SidePanel } from '@/components/ui/SidePanel';
import { Architect, ArchitectStatus } from '@/types';
import { toaster } from '@/components/ui/toaster';
import { formatEnum } from '@/utils/format';

const STATUSES: ArchitectStatus[] = ['PROSPECT', 'ACTIVE', 'INACTIVE', 'BLOCKED'];

export default function ArchitectsPage() {
  const [architects, setArchitects] = useState<Architect[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Architect | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [discount, setDiscount] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/architects?take=500').then(r => r.json()).then(d => setArchitects(Array.isArray(d) ? d : [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openDetail = (a: Architect) => {
    setSelected(a);
    setDiscount(a.currentDiscount != null ? String(Number(a.currentDiscount)) : '');
    setDiscountReason('');
    setDetailOpen(true);
  };

  const patch = async (body: Record<string, unknown>, message: string) => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/architects/${selected.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toaster.create({ title: message, type: 'success', duration: 2000 });
        const updated = await res.json();
        setSelected(prev => prev ? { ...prev, ...updated } : prev);
        load();
      } else {
        const err = await res.json();
        toaster.create({ title: err.error ?? 'Update failed', type: 'error', duration: 3000 });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader title="Architect Partners" subtitle={`${architects.length} total`} />

      {loading ? (
        <Text color="gray.400" fontSize="sm">Loading architects…</Text>
      ) : architects.length === 0 ? (
        <EmptyState icon="🏛️" title="No architect partners" description="Architects register from the public site and appear here for approval." />
      ) : (
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: 700 }}>
              <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Box as="tr">
                  {['Code', 'Firm', 'Contact', 'Email', 'License', 'Discount', 'Status'].map(h => (
                    <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {architects.map(a => (
                  <Box as="tr" key={a.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'blue.50', cursor: 'pointer' }} onClick={() => openDetail(a)}>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" fontFamily="mono" color="gray.500">{a.architectCode}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={600}>{a.firmName}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm">{a.contactPerson ?? '—'}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.500">{a.email ?? '—'}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" fontFamily="mono" color="gray.500">{a.licenseNumber ?? '—'}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={600}>{a.currentDiscount != null ? `${Number(a.currentDiscount)}%` : '—'}</Text></Box>
                    <Box as="td" px={4} py={3}><StatusBadge status={a.status} /></Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <SidePanel open={detailOpen} onClose={() => setDetailOpen(false)}
        title={selected && <Text fontWeight={700} fontSize="sm">{selected.firmName}</Text>}>
        {selected && (
          <VStack gap={5} align="stretch">
            <SimpleGrid columns={2} gap={3}>
              <Box><Text fontSize="10px" color="gray.400">Code</Text><Text fontSize="sm" fontWeight={600} fontFamily="mono">{selected.architectCode}</Text></Box>
              <Box><Text fontSize="10px" color="gray.400">Status</Text><StatusBadge status={selected.status} /></Box>
              <Box><Text fontSize="10px" color="gray.400">Contact</Text><Text fontSize="sm" fontWeight={600}>{selected.contactPerson ?? '—'}</Text></Box>
              <Box><Text fontSize="10px" color="gray.400">Email</Text><Text fontSize="sm" fontWeight={600}>{selected.email ?? '—'}</Text></Box>
              <Box><Text fontSize="10px" color="gray.400">Phone</Text><Text fontSize="sm" fontWeight={600}>{selected.phone ?? '—'}</Text></Box>
              <Box><Text fontSize="10px" color="gray.400">License</Text><Text fontSize="sm" fontWeight={600}>{selected.licenseNumber ?? '—'}</Text></Box>
            </SimpleGrid>

            <Separator />

            <Box>
              <Text fontWeight={700} fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="widest">Status</Text>
              <HStack gap={2} flexWrap="wrap">
                {STATUSES.map(s => (
                  <Button key={s} size="sm" variant={selected.status === s ? 'solid' : 'outline'}
                    colorPalette={s === 'ACTIVE' ? 'green' : s === 'BLOCKED' ? 'red' : 'gray'}
                    onClick={() => patch({ status: s }, `Marked ${formatEnum(s)}`)}>
                    {formatEnum(s)}
                  </Button>
                ))}
              </HStack>
            </Box>

            <Separator />

            <Box>
              <Text fontWeight={700} fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="widest">Discount</Text>
              <VStack gap={3} align="stretch">
                <Field.Root><Field.Label fontSize="xs">Percentage</Field.Label>
                  <Input size="sm" type="number" value={discount} onChange={e => setDiscount(e.target.value)} />
                </Field.Root>
                <Field.Root><Field.Label fontSize="xs">Reason</Field.Label>
                  <Textarea size="sm" rows={2} value={discountReason} onChange={e => setDiscountReason(e.target.value)} />
                </Field.Root>
                <Button size="sm" colorPalette="blue" onClick={() => patch({ discount: Number(discount), discountReason }, 'Discount updated')} loading={saving}>
                  Update Discount
                </Button>
              </VStack>
            </Box>

            {selected.discountHistory && selected.discountHistory.length > 0 && (
              <>
                <Separator />
                <Box>
                  <Text fontWeight={700} fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="widest">History</Text>
                  <VStack gap={2} align="stretch">
                    {selected.discountHistory.map(h => (
                      <Flex key={h.id} justify="space-between" bg="gray.50" rounded="lg" px={3} py={2}>
                        <Box>
                          <Text fontSize="sm" fontWeight={600}>{Number(h.previousDiscount)}% → {Number(h.newDiscount)}%</Text>
                          {h.reason && <Text fontSize="xs" color="gray.500">{h.reason}</Text>}
                        </Box>
                        <Text fontSize="xs" color="gray.500">{new Date(h.effectiveFrom).toLocaleDateString()}</Text>
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              </>
            )}
          </VStack>
        )}
      </SidePanel>
    </Box>
  );
}
