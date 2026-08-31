'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Text, SimpleGrid, Flex, HStack, Button, VStack, TabsRoot, TabsList, TabsTrigger, TabsContent } from '@chakra-ui/react';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { EmptyState } from '@/components/ui/EmptyState';
import { RFQ, Quote } from '@/types';
import { formatCurrency } from '@/utils/format';

export default function CustomerDashboard() {
  const { user, loading, isCustomer, logout } = useAuth();
  const router = useRouter();

  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!isCustomer) { router.replace('/login'); return; }
    Promise.all([
      fetch('/api/rfqs?take=100').then(r => r.json()),
      fetch('/api/quotes?take=100').then(r => r.json()),
    ]).then(([r, q]) => {
      setRfqs(r.rfqs ?? []);
      setQuotes(q.quotes ?? []);
    }).finally(() => setDataLoading(false));
  }, [loading, isCustomer, router]);

  if (loading || dataLoading) return <Box p={20} textAlign="center" color="gray.400">Loading…</Box>;
  if (!isCustomer) return null;

  const handleLogout = () => logout().then(() => router.push('/login'));

  const stats = {
    total: rfqs.length,
    active: rfqs.filter(r => r.status === 'NEW' || r.status === 'UNDER_REVIEW').length,
    pending: quotes.filter(q => q.status === 'SHARED' || q.status === 'FOLLOW_UP' || q.status === 'NEGOTIATION').length,
    accepted: quotes.filter(q => q.status === 'ACCEPTED' || q.status === 'CONVERTED_TO_SO').length,
  };

  return (
    <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} color="gray.900">My Dashboard</Text>
          <Text color="gray.500" fontSize="sm">{user.name} · Track your quotes &amp; orders</Text>
        </Box>
        <HStack gap={2}>
          <Link href="/catalogue"><Button colorPalette="blue" size="sm">+ New Quote Request</Button></Link>
          <Button size="sm" variant="ghost" colorPalette="red" onClick={handleLogout}>Sign Out</Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={8}>
        <KPICard label="Total RFQs" value={stats.total} icon="📋" colorScheme="blue" />
        <KPICard label="Active RFQs" value={stats.active} icon="⏳" colorScheme="orange" />
        <KPICard label="Open Quotes" value={stats.pending} icon="💬" colorScheme="purple" />
        <KPICard label="Won / Ordered" value={stats.accepted} icon="✅" colorScheme="green" />
      </SimpleGrid>

      <TabsRoot defaultValue="rfqs">
        <TabsList mb={5} borderBottom="1px solid" borderColor="gray.100">
          <TabsTrigger value="rfqs">My RFQs ({rfqs.length})</TabsTrigger>
          <TabsTrigger value="quotes">My Quotes ({quotes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="rfqs">
          {rfqs.length === 0 ? (
            <EmptyState icon="📋" title="No RFQs yet" action={<Link href="/catalogue"><Button colorPalette="blue" size="sm">Browse Products</Button></Link>} />
          ) : (
            <VStack gap={3} align="stretch">
              {rfqs.map(rfq => (
                <Box key={rfq.id} bg="white" rounded="xl" p={4} border="1px solid" borderColor="gray.100" shadow="sm">
                  <Flex justify="space-between" flexWrap="wrap" gap={3}>
                    <Box>
                      <HStack gap={2} mb={1}>
                        <Text fontWeight={700} fontSize="sm" color="blue.700" fontFamily="mono">{rfq.rfqNumber}</Text>
                        <StatusBadge status={rfq.status} />
                      </HStack>
                      <Text fontWeight={600} color="gray.800">{rfq.subject ?? '—'}</Text>
                      <HStack gap={3} mt={1} flexWrap="wrap">
                        <Text fontSize="xs" color="gray.500">📦 {rfq.items?.length ?? 0} products</Text>
                        <Text fontSize="xs" color="gray.500">📅 {new Date(rfq.createdAt).toLocaleDateString()}</Text>
                      </HStack>
                    </Box>
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}
        </TabsContent>

        <TabsContent value="quotes">
          {quotes.length === 0 ? (
            <EmptyState icon="💬" title="No quotes yet" description="Quotes from our team will appear here once your RFQs are reviewed." />
          ) : (
            <VStack gap={3} align="stretch">
              {quotes.map(quote => (
                <Box key={quote.id} bg="white" rounded="xl" p={4} border="1px solid" borderColor="gray.100" shadow="sm">
                  <Flex justify="space-between" flexWrap="wrap" gap={3}>
                    <Box>
                      <HStack gap={2} mb={1}>
                        <Text fontWeight={700} fontSize="sm" color="green.700" fontFamily="mono">{quote.quoteNumber}</Text>
                        <StatusBadge status={quote.status} />
                      </HStack>
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        Valid until {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : '—'}
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontSize="xs" color="gray.500">Quote Value</Text>
                      <Text fontWeight={800} fontSize="lg" color="gray.900">{formatCurrency(Number(quote.totalAmount))}</Text>
                      <Link href={`/quotation/${quote.id}`}>
                        <Button size="sm" colorPalette="blue" mt={2} rounded="lg">View Quote</Button>
                      </Link>
                    </Box>
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}
        </TabsContent>
      </TabsRoot>
    </Box>
  );
}
