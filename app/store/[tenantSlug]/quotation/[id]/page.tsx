'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, Text, HStack, VStack, Flex, Separator, Button, SimpleGrid } from '@chakra-ui/react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Quote } from '@/types';
import { formatCurrency, formatEnum } from '@/utils/format';
import { toaster } from '@/components/ui/toaster';

export default function StoreQuotationDetailPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; id: string }>;
}) {
  const { tenantSlug, id } = use(params);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const load = () => {
    fetch(`/api/quotes/${id}`).then(r => r.ok ? r.json() : null).then(q => setQuote(q)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [id]);

  const setStatus = async (status: string, extra?: Record<string, unknown>) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra }),
      });
      if (res.ok) {
        toaster.create({ title: `Quote ${formatEnum(status)}`, type: 'success', duration: 2000 });
        load();
      } else {
        const data = await res.json();
        toaster.create({ title: data.error ?? 'Update failed', type: 'error', duration: 3000 });
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Box p={20} textAlign="center" color="gray.400">Loading…</Box>;
  if (!quote) return <Box p={20} textAlign="center" color="gray.400">Quote not found.</Box>;

  return (
    <Box maxW="960px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
      <HStack gap={1} mb={5} fontSize="sm" color="gray.500">
        <Link href={`/store/${tenantSlug}/dashboard`} style={{ textDecoration: 'none', color: 'inherit' }}>Dashboard</Link>
        <Text>/</Text>
        <Text color="gray.800" fontWeight={500}>{quote.quoteNumber}</Text>
      </HStack>

      <Flex justify="space-between" align="flex-start" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <HStack gap={2} mb={1}>
            <Text fontFamily="mono" fontWeight={800} fontSize="xl" color="green.700">{quote.quoteNumber}</Text>
            <StatusBadge status={quote.status} />
          </HStack>
          <Text color="gray.500" fontSize="sm">Valid until {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : '—'}</Text>
        </Box>
        <Box textAlign="right">
          <Text fontSize="xs" color="gray.500">Total</Text>
          <Text fontWeight={800} fontSize="2xl" color="gray.900">{formatCurrency(Number(quote.totalAmount))}</Text>
        </Box>
      </Flex>

      <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm" mb={5}>
        <Text fontWeight={700} fontSize="sm" color="gray.700" mb={3}>Line Items</Text>
        <VStack gap={2} align="stretch">
          {quote.items?.map((li, i) => (
            <Flex key={i} justify="space-between" bg="gray.50" rounded="lg" px={3} py={2.5}>
              <Box>
                <Text fontSize="sm" fontWeight={600}>{li.productNameSnapshot ?? li.description ?? '—'}</Text>
                <Text fontSize="xs" color="gray.500">Qty {String(li.quantity)} · Unit ₹{Number(li.unitPrice).toLocaleString()}</Text>
              </Box>
              <Text fontSize="sm" fontWeight={700}>{formatCurrency(Number(li.lineTotal))}</Text>
            </Flex>
          ))}
        </VStack>
        <Separator my={4} />
        <SimpleGrid columns={2} gap={2}>
          <Text fontSize="sm" color="gray.500">Subtotal</Text><Text fontSize="sm" textAlign="right">{formatCurrency(Number(quote.subtotal))}</Text>
          <Text fontSize="sm" color="gray.500">Discount</Text><Text fontSize="sm" textAlign="right">− {formatCurrency(Number(quote.discountAmount))}</Text>
          <Text fontSize="sm" color="gray.500">Tax</Text><Text fontSize="sm" textAlign="right">{formatCurrency(Number(quote.taxAmount))}</Text>
          <Text fontSize="sm" color="gray.500">Delivery</Text><Text fontSize="sm" textAlign="right">{formatCurrency(Number(quote.deliveryCharges))}</Text>
          <Text fontWeight={800}>Total</Text><Text fontWeight={800} textAlign="right">{formatCurrency(Number(quote.totalAmount))}</Text>
        </SimpleGrid>
      </Box>

      {quote.termsAndConditions && (
        <Box bg="gray.50" rounded="xl" p={4} mb={5}>
          <Text fontSize="10px" color="gray.400" fontWeight={600} mb={1}>TERMS</Text>
          <Text fontSize="xs" color="gray.600" whiteSpace="pre-line">{quote.termsAndConditions}</Text>
        </Box>
      )}

      {(quote.status === 'SHARED' || quote.status === 'FOLLOW_UP' || quote.status === 'NEGOTIATION') && (
        <HStack gap={3} justify="flex-end">
          <Button colorPalette="red" variant="outline" onClick={() => setStatus('REJECTED', { rejectionReason: 'Declined by customer' })} loading={updating}>Decline</Button>
          <Button colorPalette="green" onClick={() => setStatus('ACCEPTED')} loading={updating}>Accept Quote</Button>
        </HStack>
      )}
    </Box>
  );
}
