'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Text, Flex, SimpleGrid, HStack, Button, VStack, TabsRoot, TabsList, TabsTrigger, TabsContent } from '@chakra-ui/react';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { RFQ, Quote } from '@/types';
import { formatCurrency } from '@/utils/format';

export default function ArchitectPortalPage() {
  const { user, loading, isArchitect, logout } = useAuth();
  const router = useRouter();

  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [architect, setArchitect] = useState<{ firmName: string; currentDiscount?: number | string | null; status: string } | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!isArchitect) { router.replace('/login'); return; }
    Promise.all([
      fetch('/api/rfqs?take=100').then(r => r.json()),
      fetch('/api/quotes?take=100').then(r => r.json()),
      fetch(`/api/architects?take=1`).then(r => r.ok ? r.json() : []),
    ]).then(([r, q, aList]) => {
      setRfqs(r.rfqs ?? []);
      setQuotes(q.quotes ?? []);
      const me = Array.isArray(aList) ? aList.find((a: { id: string }) => a.id === user.architectId) : null;
      setArchitect(me ?? null);
    }).finally(() => setDataLoading(false));
  }, [loading, isArchitect, router, user.architectId]);

  if (loading || dataLoading) return <Box p={20} textAlign="center" color="gray.400">Loading…</Box>;
  if (!isArchitect) return null;

  const handleLogout = () => logout().then(() => router.push('/login'));

  return (
    <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} color="gray.900">Architect Portal</Text>
          <Text color="gray.500" fontSize="sm">Welcome back, {user.name}</Text>
        </Box>
        <HStack gap={2}>
          <Link href="/catalogue"><Button colorPalette="blue" size="sm">Browse Products</Button></Link>
          <Button size="sm" variant="ghost" colorPalette="red" onClick={handleLogout}>Sign Out</Button>
        </HStack>
      </Flex>

      {architect && (
        <Box bg="linear-gradient(135deg,#37463e,#6b8375)" color="white" rounded="xl" p={6} mb={6}>
          <Text fontSize="xs" letterSpacing="wide" mb={1} opacity={0.7}>ARCHITECT DISCOUNT</Text>
          <Flex align="baseline" gap={4} flexWrap="wrap">
            <Text fontSize="4xl" fontWeight={800}>
              {architect.currentDiscount != null ? `${Number(architect.currentDiscount)}%` : '—'}
            </Text>
            <Box>
              <Text fontWeight={600}>{architect.firmName}</Text>
              <StatusBadge status={architect.status} />
            </Box>
          </Flex>
        </Box>
      )}

      <TabsRoot defaultValue="rfqs">
        <TabsList mb={5} borderBottom="1px solid" borderColor="gray.100">
          <TabsTrigger value="rfqs">My RFQs ({rfqs.length})</TabsTrigger>
          <TabsTrigger value="quotes">My Quotes ({quotes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="rfqs">
          {rfqs.length === 0 ? (
            <EmptyState icon="📋" title="No RFQs yet" />
          ) : (
            <VStack gap={3} align="stretch">
              {rfqs.map(rfq => (
                <Box key={rfq.id} bg="white" rounded="xl" p={4} border="1px solid" borderColor="gray.100" shadow="sm">
                  <HStack gap={2}>
                    <Text fontFamily="mono" fontWeight={700} fontSize="sm" color="blue.700">{rfq.rfqNumber}</Text>
                    <StatusBadge status={rfq.status} />
                  </HStack>
                  <Text fontWeight={600} color="gray.800" mt={1}>{rfq.subject ?? '—'}</Text>
                </Box>
              ))}
            </VStack>
          )}
        </TabsContent>

        <TabsContent value="quotes">
          {quotes.length === 0 ? (
            <EmptyState icon="💬" title="No quotes yet" />
          ) : (
            <VStack gap={3} align="stretch">
              {quotes.map(q => (
                <Box key={q.id} bg="white" rounded="xl" p={4} border="1px solid" borderColor="gray.100" shadow="sm">
                  <Flex justify="space-between" flexWrap="wrap">
                    <HStack gap={2}>
                      <Text fontFamily="mono" fontWeight={700} fontSize="sm" color="green.700">{q.quoteNumber}</Text>
                      <StatusBadge status={q.status} />
                    </HStack>
                    <Text fontWeight={800}>{formatCurrency(Number(q.totalAmount))}</Text>
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
