'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, SimpleGrid, Text, Flex, VStack, HStack, Button } from '@chakra-ui/react';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RFQ, Quote, FollowUp, SalesOrder, Customer, Architect } from '@/types';
import { formatCurrency } from '@/utils/format';

export default function AdminDashboard() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [architects, setArchitects] = useState<Architect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/rfqs?take=200').then(r => r.json()),
      fetch('/api/quotes?take=200').then(r => r.json()),
      fetch('/api/follow-ups?take=100').then(r => r.json()),
      fetch('/api/sales-orders?take=200').then(r => r.json()),
      fetch('/api/customers?take=500').then(r => r.json()),
      fetch('/api/architects?take=500').then(r => r.ok ? r.json() : []),
    ]).then(([r, q, fu, so, cu, ar]) => {
      setRfqs(r.rfqs ?? []);
      setQuotes(q.quotes ?? []);
      setFollowUps(fu.followUps ?? []);
      setSalesOrders(so.salesOrders ?? []);
      setCustomers(cu.customers ?? []);
      setArchitects(Array.isArray(ar) ? ar : []);
    }).finally(() => setLoading(false));
  }, []);

  const now = Date.now();
  const isDue = (iso?: string | null) => iso ? new Date(iso).getTime() <= now : false;

  const kpis = {
    customers: customers.length,
    architects: architects.filter(a => a.status === 'ACTIVE').length,
    pendingRFQs: rfqs.filter(r => r.status === 'NEW').length,
    pendingQuotes: quotes.filter(q => q.status === 'DRAFT').length,
    followUpsDue: followUps.filter(f => f.status === 'OPEN' && isDue(f.nextFollowUpAt)).length,
    wonQuotes: quotes.filter(q => q.status === 'ACCEPTED' || q.status === 'CONVERTED_TO_SO').length,
    lostQuotes: quotes.filter(q => q.status === 'REJECTED').length,
    soCount: salesOrders.length,
  };

  const funnelStages = [
    { label: 'RFQs', count: rfqs.length, color: '#4299e1', pct: 100 },
    { label: 'Quotes Created', count: quotes.length, color: '#9f7aea', pct: rfqs.length ? Math.round((quotes.length / rfqs.length) * 100) : 0 },
    { label: 'Follow-ups', count: followUps.length, color: '#f6ad55', pct: rfqs.length ? Math.round((followUps.length / rfqs.length) * 100) : 0 },
    { label: 'Won', count: kpis.wonQuotes, color: '#68d391', pct: rfqs.length ? Math.round((kpis.wonQuotes / rfqs.length) * 100) : 0 },
  ];

  const recentRFQs = rfqs.slice(0, 5);
  const dueList = followUps.filter(f => f.status === 'OPEN').slice(0, 5);
  const revenue = salesOrders.reduce((s, so) => s + Number(so.totalAmount ?? 0), 0);

  if (loading) return <Box p={20} textAlign="center" color="gray.400">Loading…</Box>;

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} color="gray.900">Dashboard</Text>
          <Text color="gray.500" fontSize="sm">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </Box>
        <Link href="/admin/rfqs"><Button colorPalette="blue" size="sm">View All RFQs →</Button></Link>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={8}>
        <KPICard label="Customers" value={kpis.customers} icon="👥" colorScheme="blue" />
        <KPICard label="Architects" value={kpis.architects} icon="🏛️" colorScheme="purple" />
        <KPICard label="Pending RFQs" value={kpis.pendingRFQs} icon="📋" colorScheme="orange" />
        <KPICard label="Draft Quotes" value={kpis.pendingQuotes} icon="⏳" colorScheme="red" />
        <KPICard label="Follow-ups Due" value={kpis.followUpsDue} icon="📅" colorScheme="orange" />
        <KPICard label="Won Quotes" value={kpis.wonQuotes} icon="🏆" colorScheme="green" />
        <KPICard label="Lost Quotes" value={kpis.lostQuotes} icon="📉" colorScheme="red" />
        <KPICard label="Sales Orders" value={kpis.soCount} icon="🛒" colorScheme="teal" />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} mb={6}>
        <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm">
          <Text fontWeight={700} color="gray.800" mb={4}>Sales Funnel</Text>
          <VStack gap={3} align="stretch">
            {funnelStages.map(stage => (
              <Box key={stage.label}>
                <Flex justify="space-between" mb={1}>
                  <Text fontSize="sm" color="gray.600">{stage.label}</Text>
                  <Text fontSize="sm" fontWeight={700}>{stage.count}</Text>
                </Flex>
                <Box bg="gray.100" rounded="full" h={2}>
                  <Box bg={stage.color} rounded="full" h={2} w={`${stage.pct}%`} transition="width 0.5s" />
                </Box>
              </Box>
            ))}
          </VStack>
          <Box mt={4} pt={4} borderTop="1px solid" borderColor="gray.100">
            <Text fontSize="xs" color="gray.500">Revenue booked</Text>
            <Text fontSize="xl" fontWeight={800}>{formatCurrency(revenue)}</Text>
          </Box>
        </Box>

        <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight={700} color="gray.800">Recent RFQs</Text>
            <Link href="/admin/rfqs"><Text fontSize="xs" color="blue.600" fontWeight={600}>View all →</Text></Link>
          </Flex>
          <VStack gap={2} align="stretch">
            {recentRFQs.length === 0 && <Text color="gray.400" fontSize="sm">No RFQs yet.</Text>}
            {recentRFQs.map(rfq => (
              <Flex key={rfq.id} justify="space-between" align="center" py={2} borderBottom="1px solid" borderColor="gray.50">
                <Box>
                  <Text fontSize="xs" fontWeight={700} color="gray.700" fontFamily="mono">{rfq.rfqNumber}</Text>
                  <Text fontSize="xs" color="gray.500">{rfq.customer?.companyName ?? '—'}</Text>
                </Box>
                <StatusBadge status={rfq.status} />
              </Flex>
            ))}
          </VStack>
        </Box>

        <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight={700} color="gray.800">Due Follow-ups</Text>
            <Link href="/admin/follow-ups"><Text fontSize="xs" color="blue.600" fontWeight={600}>View all →</Text></Link>
          </Flex>
          <VStack gap={2} align="stretch">
            {dueList.length === 0 && <Text color="gray.400" fontSize="sm">No follow-ups.</Text>}
            {dueList.map(fu => (
              <Flex key={fu.id} justify="space-between" align="center" py={2} borderBottom="1px solid" borderColor="gray.50">
                <Box>
                  <Text fontSize="xs" fontWeight={700} color="gray.700">{fu.customer?.companyName ?? '—'}</Text>
                  <Text fontSize="xs" color="gray.500">{fu.quote?.quoteNumber ?? '—'}</Text>
                </Box>
                <Text fontSize="xs" color={isDue(fu.nextFollowUpAt) ? 'red.500' : 'gray.500'}>
                  {fu.nextFollowUpAt ? new Date(fu.nextFollowUpAt).toLocaleDateString() : '—'}
                </Text>
              </Flex>
            ))}
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
