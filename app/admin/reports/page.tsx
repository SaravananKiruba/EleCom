'use client';

import { useEffect, useState } from 'react';
import { Box, Text, SimpleGrid, Flex, VStack, Button } from '@chakra-ui/react';
import { PageHeader } from '@/components/ui/PageHeader';
import { KPICard } from '@/components/ui/KPICard';
import { RFQ, Quote, SalesOrder } from '@/types';
import { downloadCSV } from '@/utils/csvExport';
import { formatCurrency, formatEnum } from '@/utils/format';

export default function ReportsPage() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [sos, setSos] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/rfqs?take=1000').then(r => r.json()),
      fetch('/api/quotes?take=1000').then(r => r.json()),
      fetch('/api/sales-orders?take=1000').then(r => r.json()),
    ]).then(([r, q, so]) => {
      setRfqs(r.rfqs ?? []);
      setQuotes(q.quotes ?? []);
      setSos(so.salesOrders ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const won = quotes.filter(q => q.status === 'ACCEPTED' || q.status === 'CONVERTED_TO_SO');
  const lost = quotes.filter(q => q.status === 'REJECTED');
  const wonValue = won.reduce((s, q) => s + Number(q.totalAmount ?? 0), 0);
  const revenue = sos.reduce((s, so) => s + Number(so.totalAmount ?? 0), 0);
  const conversion = rfqs.length ? Math.round((won.length / rfqs.length) * 100) : 0;

  const byStatus = <T extends { status: string }>(items: T[]): { status: string; count: number }[] => {
    const map: Record<string, number> = {};
    items.forEach(i => { map[i.status] = (map[i.status] ?? 0) + 1; });
    return Object.entries(map).map(([status, count]) => ({ status, count }));
  };

  if (loading) return <Box p={20} textAlign="center" color="gray.400">Loading reports…</Box>;

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader title="Reports" subtitle="Sales performance" />

      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={8}>
        <KPICard label="Total RFQs" value={rfqs.length} icon="📋" colorScheme="blue" />
        <KPICard label="Won Quotes" value={won.length} icon="🏆" colorScheme="green" />
        <KPICard label="Conversion" value={`${conversion}%`} icon="📈" colorScheme="purple" />
        <KPICard label="Revenue Booked" value={formatCurrency(revenue)} icon="💰" colorScheme="teal" />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={8}>
        <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm">
          <Text fontWeight={700} mb={3}>RFQs by Status</Text>
          <VStack gap={2} align="stretch">
            {byStatus(rfqs).map(({ status, count }) => (
              <Flex key={status} justify="space-between">
                <Text fontSize="sm" color="gray.600">{formatEnum(status)}</Text>
                <Text fontSize="sm" fontWeight={700}>{count}</Text>
              </Flex>
            ))}
          </VStack>
        </Box>
        <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm">
          <Text fontWeight={700} mb={3}>Quotes by Status</Text>
          <VStack gap={2} align="stretch">
            {byStatus(quotes).map(({ status, count }) => (
              <Flex key={status} justify="space-between">
                <Text fontSize="sm" color="gray.600">{formatEnum(status)}</Text>
                <Text fontSize="sm" fontWeight={700}>{count}</Text>
              </Flex>
            ))}
          </VStack>
        </Box>
        <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm">
          <Text fontWeight={700} mb={3}>SOs by Status</Text>
          <VStack gap={2} align="stretch">
            {byStatus(sos).map(({ status, count }) => (
              <Flex key={status} justify="space-between">
                <Text fontSize="sm" color="gray.600">{formatEnum(status)}</Text>
                <Text fontSize="sm" fontWeight={700}>{count}</Text>
              </Flex>
            ))}
          </VStack>
        </Box>
      </SimpleGrid>

      <Flex gap={3} flexWrap="wrap">
        <Button size="sm" variant="outline"
          onClick={() => downloadCSV(rfqs.map(r => ({ RFQ: r.rfqNumber, Customer: r.customer?.companyName ?? '', Status: r.status, Date: new Date(r.createdAt).toLocaleDateString() })), 'rfqs.csv')}>
          ↓ Export RFQs
        </Button>
        <Button size="sm" variant="outline"
          onClick={() => downloadCSV(quotes.map(q => ({ Quote: q.quoteNumber, Customer: q.customer?.companyName ?? '', Total: Number(q.totalAmount).toFixed(2), Status: q.status })), 'quotes.csv')}>
          ↓ Export Quotes
        </Button>
        <Button size="sm" variant="outline"
          onClick={() => downloadCSV(sos.map(s => ({ SO: s.soNumber, Customer: s.customer?.companyName ?? '', Total: Number(s.totalAmount).toFixed(2), Status: s.status })), 'sales-orders.csv')}>
          ↓ Export Sales Orders
        </Button>
      </Flex>
      <Text mt={4} fontSize="xs" color="gray.400">Won value (accepted + converted quotes): {formatCurrency(wonValue)} · Lost quotes: {lost.length}</Text>
    </Box>
  );
}
