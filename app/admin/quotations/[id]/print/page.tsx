'use client';

import { use, useEffect, useState } from 'react';
import { Box, Text, HStack, VStack, Flex, SimpleGrid, Separator, Button } from '@chakra-ui/react';
import { Quote } from '@/types';
import { formatCurrency, formatEnum } from '@/utils/format';

export default function QuotePrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    fetch(`/api/quotes/${id}`).then(r => r.ok ? r.json() : null).then(setQuote);
  }, [id]);

  useEffect(() => {
    if (quote) setTimeout(() => window.print(), 400);
  }, [quote]);

  if (!quote) return <Box p={20} textAlign="center" color="gray.400">Loading…</Box>;

  return (
    <Box maxW="820px" mx="auto" p={{ base: 6, md: 10 }} bg="white" color="gray.900">
      <Flex justify="space-between" mb={8}>
        <Box>
          <Text fontSize="2xl" fontWeight={800}>Quotation</Text>
          <Text fontSize="xs" color="gray.500" fontFamily="mono">{quote.quoteNumber}</Text>
        </Box>
        <Box textAlign="right">
          <Text fontSize="xs" color="gray.500">Status</Text>
          <Text fontWeight={700}>{formatEnum(quote.status)}</Text>
          <Text fontSize="xs" color="gray.500" mt={1}>Valid until {quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : '—'}</Text>
        </Box>
      </Flex>

      <SimpleGrid columns={2} gap={4} mb={6}>
        <Box>
          <Text fontSize="10px" color="gray.400" fontWeight={600}>CUSTOMER</Text>
          <Text fontWeight={600}>{quote.customer?.companyName ?? '—'}</Text>
          <Text fontSize="sm" color="gray.600">{quote.customer?.contactPerson ?? ''}</Text>
        </Box>
        <Box textAlign="right">
          <Text fontSize="10px" color="gray.400" fontWeight={600}>REFERENCE</Text>
          <Text fontWeight={600}>{quote.rfq?.rfqNumber ?? '—'}</Text>
          <Text fontSize="sm" color="gray.600">{new Date(quote.createdAt).toLocaleDateString()}</Text>
        </Box>
      </SimpleGrid>

      <Box as="table" w="full" style={{ borderCollapse: 'collapse' }} mb={6}>
        <Box as="thead" borderBottom="2px solid" borderColor="gray.300">
          <Box as="tr">
            {['#', 'Description', 'Qty', 'Unit', 'Disc %', 'Tax %', 'Total'].map(h => (
              <Box key={h} as="th" p={2} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase">{h}</Box>
            ))}
          </Box>
        </Box>
        <Box as="tbody">
          {(quote.items ?? []).map((li, i) => (
            <Box as="tr" key={i} borderBottom="1px solid" borderColor="gray.100">
              <Box as="td" p={2}><Text fontSize="xs">{i + 1}</Text></Box>
              <Box as="td" p={2}><Text fontSize="sm" fontWeight={600}>{li.productNameSnapshot ?? '—'}</Text></Box>
              <Box as="td" p={2}><Text fontSize="sm">{String(li.quantity)}</Text></Box>
              <Box as="td" p={2}><Text fontSize="sm">₹{Number(li.unitPrice).toLocaleString()}</Text></Box>
              <Box as="td" p={2}><Text fontSize="sm">{String(li.discountPercent ?? 0)}%</Text></Box>
              <Box as="td" p={2}><Text fontSize="sm">{String(li.taxPercent ?? 0)}%</Text></Box>
              <Box as="td" p={2}><Text fontSize="sm" fontWeight={700}>{formatCurrency(Number(li.lineTotal))}</Text></Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Flex justify="flex-end" mb={6}>
        <VStack align="stretch" gap={1} minW="260px">
          <Flex justify="space-between"><Text fontSize="sm">Subtotal</Text><Text fontSize="sm">{formatCurrency(Number(quote.subtotal))}</Text></Flex>
          <Flex justify="space-between"><Text fontSize="sm">Discount</Text><Text fontSize="sm">− {formatCurrency(Number(quote.discountAmount))}</Text></Flex>
          <Flex justify="space-between"><Text fontSize="sm">Tax</Text><Text fontSize="sm">{formatCurrency(Number(quote.taxAmount))}</Text></Flex>
          <Flex justify="space-between"><Text fontSize="sm">Delivery</Text><Text fontSize="sm">{formatCurrency(Number(quote.deliveryCharges))}</Text></Flex>
          <Separator />
          <Flex justify="space-between"><Text fontWeight={800}>Grand Total</Text><Text fontWeight={800}>{formatCurrency(Number(quote.totalAmount))}</Text></Flex>
        </VStack>
      </Flex>

      {quote.termsAndConditions && (
        <Box>
          <Text fontSize="10px" color="gray.400" fontWeight={600}>TERMS &amp; CONDITIONS</Text>
          <Text fontSize="xs" color="gray.600" whiteSpace="pre-line">{quote.termsAndConditions}</Text>
        </Box>
      )}

      <Box mt={8} textAlign="center" className="no-print">
        <Button onClick={() => window.print()} colorPalette="blue">Print</Button>
      </Box>
      <style>{`@media print { .no-print { display: none; } }`}</style>
    </Box>
  );
}
