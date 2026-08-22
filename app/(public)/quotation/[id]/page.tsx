'use client';

import {
  Box, Text, Button, HStack, VStack, Flex, SimpleGrid, Badge, Separator,
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogBody, DialogFooter,
  DialogCloseTrigger, Textarea, Field,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { products, brands } from '@/data/mockData';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { toaster } from '@/components/ui/toaster';

export default function QuotationViewPage() {
  const params = useParams();
  const id = params?.id as string;
  const { state, dispatch } = useAppState();
  const quote = state.quotes.find(q => q.id === id);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  if (!quote) return notFound();

  const lineTotal = (li: typeof quote.lineItems[0]) => {
    const afterDiscount = li.basePrice * (1 - li.discount / 100);
    const withTax = afterDiscount * (1 + li.tax / 100);
    return withTax * li.quantity;
  };
  const subtotal = quote.lineItems.reduce((sum, li) => sum + li.basePrice * li.quantity, 0);
  const discountAmt = quote.lineItems.reduce((sum, li) => sum + li.basePrice * li.quantity * (li.discount / 100), 0);
  const taxAmt = quote.lineItems.reduce((sum, li) => {
    const after = li.basePrice * li.quantity * (1 - li.discount / 100);
    return sum + after * (li.tax / 100);
  }, 0);
  const grandTotal = subtotal - discountAmt + taxAmt + quote.deliveryCharges;

  const acceptQuote = () => {
    dispatch({ type: 'UPDATE_QUOTE', payload: { ...quote, status: 'Accepted' } });
    toaster.create({ title: 'Quote Accepted!', description: 'Our team will contact you shortly.', type: 'success', duration: 3000 });
  };

  const rejectQuote = () => {
    if (!rejectReason.trim()) return;
    dispatch({ type: 'UPDATE_QUOTE', payload: { ...quote, status: 'Rejected', rejectionReason: rejectReason } });
    setRejectOpen(false);
    toaster.create({ title: 'Quote Rejected', type: 'info', duration: 2000 });
  };

  return (
    <Box maxW="900px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
      <HStack gap={1} mb={5} fontSize="sm" color="gray.500">
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>Dashboard</Link>
        <Text>/</Text>
        <Text color="gray.800" fontWeight={500}>{quote.quoteNumber}</Text>
      </HStack>

      <Box bg="white" rounded="2xl" p={{ base: 4, md: 6 }} border="1px solid" borderColor="gray.100" shadow="sm">
        {/* Header */}
        <Flex justify="space-between" align="flex-start" mb={6} flexWrap="wrap" gap={3}>
          <Box>
            <HStack gap={2} mb={1}>
              <Text fontSize="xl" fontWeight={800} color="gray.900" fontFamily="mono">{quote.quoteNumber}</Text>
              <StatusBadge status={quote.status} />
            </HStack>
            <Text color="gray.500" fontSize="sm">RFQ Ref: {quote.rfqNumber}</Text>
          </Box>
          <Box textAlign="right">
            <Text fontSize="xs" color="gray.500">Quote Date</Text>
            <Text fontWeight={600} fontSize="sm">{quote.createdAt}</Text>
            <Text fontSize="xs" color="gray.500" mt={1}>Valid Until</Text>
            <Text fontWeight={600} fontSize="sm" color={new Date(quote.validUntil) < new Date() ? 'red.500' : 'green.600'}>{quote.validUntil}</Text>
          </Box>
        </Flex>

        <Separator mb={5} />

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={6}>
          {[['Customer', quote.customerName], ['Company', quote.companyName], ['Project', quote.projectName], ['Assigned To', quote.assignedTo || '—']].map(([l, v]) => (
            <Box key={l}>
              <Text fontSize="xs" color="gray.500" fontWeight={500}>{l}</Text>
              <Text fontWeight={600} color="gray.800" fontSize="sm">{v}</Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* Line items */}
        <Text fontWeight={700} color="gray.700" mb={3} fontSize="sm">Products</Text>
        <Box overflowX="auto" mb={4}>
          <Box as="table" w="full" style={{ borderCollapse: 'collapse' }}>
            <Box as="thead" bg="gray.50">
              <Box as="tr">
                {['Product', 'SKU', 'Qty', 'Base Price', 'Discount', 'Tax', 'Total'].map(h => (
                  <Box key={h} as="th" px={3} py={2} textAlign="left" fontSize="xs" fontWeight={600} color="gray.600" whiteSpace="nowrap">{h}</Box>
                ))}
              </Box>
            </Box>
            <Box as="tbody">
              {quote.lineItems.map(li => {
                const p = products.find(x => x.id === li.productId);
                const b = brands.find(x => x.id === p?.brandId);
                return (
                  <Box as="tr" key={li.productId} borderTop="1px solid" borderColor="gray.100">
                    <Box as="td" px={3} py={3}>
                      <Text fontSize="sm" fontWeight={600} color="gray.800">{p?.name}</Text>
                      <Text fontSize="xs" color="gray.500">{b?.name}</Text>
                    </Box>
                    <Box as="td" px={3} py={3} fontSize="xs" fontFamily="mono" color="gray.500">{p?.sku}</Box>
                    <Box as="td" px={3} py={3} fontSize="sm" fontWeight={600}>{li.quantity}</Box>
                    <Box as="td" px={3} py={3} fontSize="sm">₹{li.basePrice.toLocaleString('en-IN')}</Box>
                    <Box as="td" px={3} py={3} fontSize="sm" color="green.600">-{li.discount}%</Box>
                    <Box as="td" px={3} py={3} fontSize="sm" color="gray.600">+{li.tax}%</Box>
                    <Box as="td" px={3} py={3} fontSize="sm" fontWeight={700}>₹{lineTotal(li).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Totals */}
        <Flex justify="flex-end">
          <VStack align="stretch" minW="240px" gap={2} bg="gray.50" p={4} rounded="xl">
            {[
              ['Subtotal', `₹${subtotal.toLocaleString('en-IN')}`],
              ['Discount', `-₹${discountAmt.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`],
              ['Tax', `+₹${taxAmt.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`],
              ['Delivery', `+₹${quote.deliveryCharges.toLocaleString('en-IN')}`],
            ].map(([l, v]) => (
              <Flex key={l} justify="space-between">
                <Text fontSize="sm" color="gray.600">{l}</Text>
                <Text fontSize="sm" fontWeight={500}>{v}</Text>
              </Flex>
            ))}
            <Separator />
            <Flex justify="space-between">
              <Text fontWeight={700}>Grand Total</Text>
              <Text fontWeight={800} fontSize="lg" color="blue.700">₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
            </Flex>
          </VStack>
        </Flex>

        {/* Terms */}
        <Box mt={5} p={3} bg="gray.50" rounded="lg" border="1px solid" borderColor="gray.100">
          <Text fontSize="xs" fontWeight={600} color="gray.600" mb={1}>Terms & Conditions</Text>
          <Text fontSize="xs" color="gray.500">{quote.terms}</Text>
        </Box>

        {/* Actions */}
        {['Shared', 'Follow-Up', 'Negotiation'].includes(quote.status) && (
          <HStack gap={3} mt={6} flexWrap="wrap">
            <Button colorPalette="green" size="md" rounded="xl" flex={1} onClick={acceptQuote}>
              ✓ Accept Quote
            </Button>
            <Button colorPalette="red" variant="outline" size="md" rounded="xl" flex={1} onClick={() => setRejectOpen(true)}>
              ✗ Reject Quote
            </Button>
          </HStack>
        )}
        {quote.status === 'Accepted' && (
          <Box mt={5} p={4} bg="green.50" rounded="xl" border="1px solid" borderColor="green.200">
            <Text fontWeight={700} color="green.700">✅ You have accepted this quote.</Text>
            <Text fontSize="sm" color="green.600" mt={1}>Our team will follow up with you shortly to process the order.</Text>
          </Box>
        )}
        {quote.status === 'Rejected' && (
          <Box mt={5} p={4} bg="red.50" rounded="xl" border="1px solid" borderColor="red.200">
            <Text fontWeight={700} color="red.700">✗ Quote Rejected</Text>
            {quote.rejectionReason && <Text fontSize="sm" color="red.600" mt={1}>Reason: {quote.rejectionReason}</Text>}
          </Box>
        )}
      </Box>

      {/* Reject Modal */}
      <DialogRoot open={rejectOpen} onOpenChange={d => setRejectOpen(d.open)}>
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>
            <Text fontWeight={700}>Reject Quote</Text>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <Text fontSize="sm" color="gray.600" mb={3}>Please provide a reason for rejecting this quote.</Text>
            <Field.Root>
              <Field.Label fontSize="sm">Reason</Field.Label>
              <Textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g., Price too high, different requirement..." rows={3} />
            </Field.Root>
          </DialogBody>
          <DialogFooter gap={3}>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button colorPalette="red" onClick={rejectQuote} disabled={!rejectReason.trim()}>Reject Quote</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
}
