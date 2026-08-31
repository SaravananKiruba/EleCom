'use client';

import { Box, Text, Flex, Badge, Button, HStack } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';

interface Sub {
  id: string; status: string; trialEndDate: string | null; startDate: string | null; endDate: string | null; createdAt: string;
  tenant: { id: string; name: string; email: string };
  plan: { name: string; price: string; billingInterval: string };
}

const PAGE_SIZE = 20;
const STATUS_COLORS: Record<string, string> = {
  TRIAL: 'blue', ACTIVE: 'green', GRACE_PERIOD: 'orange', EXPIRED: 'red', SUSPENDED: 'red', CANCELLED: 'gray',
};

export default function SaasSubscriptionsPage() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ skip: String((page - 1) * PAGE_SIZE), take: String(PAGE_SIZE) });
    if (statusFilter) q.set('status', statusFilter);
    const data = await fetch(`/api/subscriptions?${q}`).then(r => r.json()).finally(() => setLoading(false));
    setSubs(data.subscriptions ?? []);
    setTotal(data.total ?? 0);
  }, [page, statusFilter]);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader title="Subscriptions" subtitle={`${total} total`} />

      <HStack gap={2} mb={5} flexWrap="wrap">
        {['', 'TRIAL', 'ACTIVE', 'GRACE_PERIOD', 'EXPIRED', 'CANCELLED'].map(s => (
          <Button key={s} size="sm" variant={statusFilter === s ? 'solid' : 'outline'}
            colorPalette={statusFilter === s ? 'blue' : 'gray'} onClick={() => { setStatusFilter(s); setPage(1); }}>
            {s || 'All'}
          </Button>
        ))}
      </HStack>

      {loading ? (
        <Box py={10} textAlign="center"><Text color="gray.400">Loading…</Text></Box>
      ) : subs.length === 0 ? (
        <EmptyState icon="💳" title="No subscriptions found" />
      ) : (
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: '700px' }}>
              <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Box as="tr">
                  {['Tenant', 'Plan', 'Status', 'Trial End', 'Period', 'Since'].map(h => (
                    <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {subs.map(s => (
                  <Box as="tr" key={s.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'gray.50' }}>
                    <Box as="td" px={4} py={3}>
                      <Text fontSize="sm" fontWeight={600} color="gray.800">{s.tenant.name}</Text>
                      <Text fontSize="xs" color="gray.400">{s.tenant.email}</Text>
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <Text fontSize="sm" fontWeight={600} color="gray.700">{s.plan.name}</Text>
                      <Text fontSize="xs" color="gray.500">₹{Number(s.plan.price).toLocaleString('en-IN')} / {s.plan.billingInterval.toLowerCase()}</Text>
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <Badge colorPalette={STATUS_COLORS[s.status] ?? 'gray'} variant="subtle" size="sm">{s.status}</Badge>
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <Text fontSize="xs" color="gray.500">{s.trialEndDate ? new Date(s.trialEndDate).toLocaleDateString('en-IN') : '—'}</Text>
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <Text fontSize="xs" color="gray.500">
                        {s.startDate ? new Date(s.startDate).toLocaleDateString('en-IN') : '—'}
                        {s.endDate ? ` → ${new Date(s.endDate).toLocaleDateString('en-IN')}` : ''}
                      </Text>
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <Text fontSize="xs" color="gray.400">{new Date(s.createdAt).toLocaleDateString('en-IN')}</Text>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </Box>
  );
}
