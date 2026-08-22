'use client';

import {
  Box, SimpleGrid, Text, Flex, VStack, HStack, Button, Badge, Separator,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useAppState } from '@/context/AppContext';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { products as allProducts } from '@/data/mockData';

export default function AdminDashboard() {
  const { state } = useAppState();
  const { rfqs, quotes, followUps, customers, architects, purchaseOrders } = state;

  const kpis = {
    customers: customers.length,
    architects: architects.filter(a => a.status === 'Active' || a.status === 'Approved').length,
    pendingRFQs: rfqs.filter(r => r.status === 'New').length,
    pendingQuotes: quotes.filter(q => q.status === 'Pending Approval').length,
    followUpsDue: followUps.filter(f => f.status === 'Scheduled' && f.nextFollowUp <= '2026-08-22').length,
    wonQuotes: quotes.filter(q => q.status === 'Accepted').length,
    lostQuotes: quotes.filter(q => q.status === 'Rejected').length,
    poCount: purchaseOrders.length,
  };

  const funnelStages = [
    { label: 'RFQs', count: rfqs.length, color: '#4299e1', pct: 100 },
    { label: 'Quotes Created', count: quotes.length, color: '#9f7aea', pct: Math.round((quotes.length / rfqs.length) * 100) },
    { label: 'Follow-ups', count: followUps.length, color: '#f6ad55', pct: Math.round((followUps.length / rfqs.length) * 100) },
    { label: 'Won', count: kpis.wonQuotes, color: '#68d391', pct: Math.round((kpis.wonQuotes / rfqs.length) * 100) },
  ];

  const recentRFQs = rfqs.slice(0, 5);
  const dueFollowUps = followUps.filter(f => f.status === 'Scheduled').slice(0, 5);

  const topProducts: Record<string, number> = {};
  rfqs.forEach(r => r.items.forEach(i => { topProducts[i.productId] = (topProducts[i.productId] || 0) + i.quantity; }));
  const topProductList = Object.entries(topProducts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <Box p={{ base: 4, md: 6 }}>
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} color="gray.900">Dashboard</Text>
          <Text color="gray.500" fontSize="sm">Saturday, 22 August 2026</Text>
        </Box>
        <Link href="/admin/rfqs">
          <Button colorPalette="blue" size="sm">View All RFQs →</Button>
        </Link>
      </Flex>

      {/* KPIs */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={8}>
        <KPICard label="Total Customers" value={kpis.customers} icon="👥" colorScheme="blue" />
        <KPICard label="Architects" value={kpis.architects} icon="🏛️" colorScheme="purple" />
        <KPICard label="Pending RFQs" value={kpis.pendingRFQs} icon="📋" colorScheme="orange" />
        <KPICard label="Pending Approvals" value={kpis.pendingQuotes} icon="⏳" colorScheme="red" />
        <KPICard label="Follow-ups Due" value={kpis.followUpsDue} icon="📅" colorScheme="orange" />
        <KPICard label="Won Quotes" value={kpis.wonQuotes} icon="🏆" colorScheme="green" />
        <KPICard label="Lost Quotes" value={kpis.lostQuotes} icon="📉" colorScheme="red" />
        <KPICard label="Purchase Orders" value={kpis.poCount} icon="🛒" colorScheme="teal" />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} mb={6}>
        {/* Sales Funnel */}
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
        </Box>

        {/* Recent RFQs */}
        <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight={700} color="gray.800">Recent RFQs</Text>
            <Link href="/admin/rfqs"><Text fontSize="xs" color="blue.600" fontWeight={600}>View all →</Text></Link>
          </Flex>
          <VStack gap={2} align="stretch">
            {recentRFQs.map(rfq => (
              <Flex key={rfq.id} justify="space-between" align="center" py={2} borderBottom="1px solid" borderColor="gray.50">
                <Box>
                  <Text fontSize="xs" fontWeight={700} color="gray.700" fontFamily="mono">{rfq.rfqNumber}</Text>
                  <Text fontSize="xs" color="gray.500">{rfq.customerName}</Text>
                </Box>
                <StatusBadge status={rfq.status} />
              </Flex>
            ))}
          </VStack>
        </Box>

        {/* Follow-ups due */}
        <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight={700} color="gray.800">Follow-ups Due</Text>
            <Link href="/admin/follow-ups"><Text fontSize="xs" color="blue.600" fontWeight={600}>View all →</Text></Link>
          </Flex>
          {dueFollowUps.length === 0 ? (
            <Text fontSize="sm" color="gray.400" textAlign="center" py={4}>No follow-ups due today</Text>
          ) : (
            <VStack gap={2} align="stretch">
              {dueFollowUps.map(fu => (
                <Box key={fu.id} py={2} borderBottom="1px solid" borderColor="gray.50">
                  <Text fontSize="xs" fontWeight={700} color="gray.700">{fu.customerName}</Text>
                  <Flex justify="space-between">
                    <Text fontSize="xs" color="gray.500">{fu.quoteNumber} • {fu.method}</Text>
                    <Text fontSize="xs" color="orange.600" fontWeight={600}>{fu.nextFollowUp}</Text>
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        {/* Top products */}
        <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm">
          <Text fontWeight={700} color="gray.800" mb={4}>Most Requested Products</Text>
          <VStack gap={3} align="stretch">
            {topProductList.map(([prodId, qty], i) => {
              const p = allProducts.find((x) => x.id === prodId);
              const maxQty = topProductList[0]?.[1] || 1;
              return (
                <Box key={prodId}>
                  <Flex justify="space-between" mb={1}>
                    <Text fontSize="xs" color="gray.700" fontWeight={500}>{p?.name || 'Unknown'}</Text>
                    <Text fontSize="xs" fontWeight={700}>{qty} units</Text>
                  </Flex>
                  <Box bg="gray.100" rounded="full" h={1.5}>
                    <Box bg="blue.400" rounded="full" h={1.5} w={`${(qty / maxQty) * 100}%`} />
                  </Box>
                </Box>
              );
            })}
          </VStack>
        </Box>

        {/* Quote status distribution */}
        <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm">
          <Text fontWeight={700} color="gray.800" mb={4}>Quote Status Distribution</Text>
          <VStack gap={3} align="stretch">
            {[
              { label: 'Shared', color: 'blue', statuses: ['Shared'] },
              { label: 'Follow-up / Negotiation', color: 'orange', statuses: ['Follow-Up', 'Negotiation'] },
              { label: 'Accepted', color: 'green', statuses: ['Accepted'] },
              { label: 'Rejected', color: 'red', statuses: ['Rejected'] },
              { label: 'Draft / Pending', color: 'gray', statuses: ['Draft', 'Pending Approval', 'Approved'] },
            ].map(g => {
              const count = quotes.filter(q => g.statuses.includes(q.status)).length;
              const pct = quotes.length ? Math.round((count / quotes.length) * 100) : 0;
              const colors: Record<string, string> = { blue: '#4299e1', orange: '#f6ad55', green: '#68d391', red: '#fc8181', gray: '#cbd5e0' };
              return (
                <Box key={g.label}>
                  <Flex justify="space-between" mb={1}>
                    <Text fontSize="xs" color="gray.600">{g.label}</Text>
                    <Text fontSize="xs" fontWeight={700}>{count} ({pct}%)</Text>
                  </Flex>
                  <Box bg="gray.100" rounded="full" h={2}>
                    <Box bg={colors[g.color]} rounded="full" h={2} w={`${pct}%`} transition="width 0.5s" />
                  </Box>
                </Box>
              );
            })}
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
