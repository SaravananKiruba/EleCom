'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Text, Button, HStack, VStack, Flex, SimpleGrid, Input, Textarea, Field } from '@chakra-ui/react';
import { useAppState } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { EmptyState } from '@/components/ui/EmptyState';

interface CartProduct { id: string; name: string; sku: string; imageUrl?: string | null; }

export default function RFQPage() {
  const { state, dispatch } = useAppState();
  const { user, loading, isCustomer } = useAuth();
  const router = useRouter();
  const { cartItems } = state;

  const [products, setProducts] = useState<Record<string, CartProduct>>({});
  const [form, setForm] = useState({ subject: '', notes: '', requiredDate: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<{ rfqNumber: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (cartItems.length === 0) return;
    fetch('/api/store/current/products?take=200').then(r => r.json()).then(d => {
      const map: Record<string, CartProduct> = {};
      (d.products ?? []).forEach((p: CartProduct) => { map[p.id] = p; });
      setProducts(map);
    });
  }, [cartItems]);

  useEffect(() => {
    if (loading) return;
    if (!isCustomer) router.replace(`/login?next=${encodeURIComponent('/rfq')}`);
  }, [loading, isCustomer, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.customerId) { setError('No customer profile linked to this account. Contact support.'); return; }
    if (cartItems.length === 0) { setError('Add products to your cart first.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: user.customerId,
          source: 'WEBSITE',
          subject: form.subject || undefined,
          notes: form.notes || undefined,
          requestedDate: form.requiredDate || undefined,
          items: cartItems.map(ci => {
            const p = products[ci.productId];
            return {
              productId: ci.productId,
              productNameSnapshot: p?.name,
              skuSnapshot: p?.sku,
              quantity: ci.quantity,
            };
          }),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to submit RFQ'); return; }
      dispatch({ type: 'CLEAR_CART' });
      setSubmitted({ rfqNumber: data.rfqNumber });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box p={20} textAlign="center" color="gray.400">Loading…</Box>;
  if (!isCustomer) return null;

  if (cartItems.length === 0 && !submitted) {
    return (
      <Box maxW="900px" mx="auto" px={{ base: 4, md: 6 }} py={10}>
        <EmptyState icon="📋" title="No products in your quote cart"
          description="Add products before submitting a quote request."
          action={<Link href="/catalogue"><Button colorPalette="blue">Browse Products</Button></Link>}
        />
      </Box>
    );
  }

  if (submitted) {
    return (
      <Box maxW="680px" mx="auto" px={{ base: 4, md: 6 }} py={10} textAlign="center">
        <Box bg="green.50" rounded="2xl" p={10} border="1px solid" borderColor="green.100" shadow="sm">
          <Text fontSize="4xl" mb={4}>✅</Text>
          <Text fontSize="2xl" fontWeight={800} color="gray.900" mb={2}>Quote Request Submitted!</Text>
          <Text color="gray.600" fontSize="md" mb={6}>
            RFQ <Text as="span" fontWeight={700} fontFamily="mono" color="blue.700">{submitted.rfqNumber}</Text> received.
            Our team will send a quote shortly.
          </Text>
          <HStack gap={3} justify="center" flexWrap="wrap">
            <Link href="/dashboard"><Button colorPalette="blue" size="lg" rounded="xl">View My RFQs</Button></Link>
            <Link href="/catalogue"><Button variant="outline" size="lg" rounded="xl">Continue Browsing</Button></Link>
          </HStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
      <HStack gap={1} mb={5} fontSize="sm" color="gray.500">
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
        <Text>/</Text>
        <Link href="/quote-cart" style={{ textDecoration: 'none', color: 'inherit' }}>Quote Cart</Link>
        <Text>/</Text>
        <Text color="gray.800" fontWeight={500}>Request Quote</Text>
      </HStack>

      <Text fontSize="2xl" fontWeight={700} color="gray.900" mb={1}>Request a Quote</Text>
      <Text color="gray.500" fontSize="sm" mb={6}>Signed in as {user.name}. We&apos;ll get back with pricing soon.</Text>

      {error && <Box bg="red.50" border="1px solid" borderColor="red.200" rounded="lg" p={3} mb={4}><Text fontSize="sm" color="red.700">{error}</Text></Box>}

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} alignItems="flex-start">
        <Box gridColumn={{ lg: 'span 2' }}>
          <Box as="form" onSubmit={submit} bg="white" rounded="2xl" p={{ base: 4, md: 6 }} border="1px solid" borderColor="gray.100" shadow="sm">
            <Text fontWeight={700} fontSize="md" color="gray.700" mb={4}>Project Details</Text>
            <VStack gap={4} align="stretch">
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Subject / Project Name</Field.Label>
                <Input placeholder="Andheri Office Complex" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
              </Field.Root>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Required Delivery Date</Field.Label>
                <Input type="date" value={form.requiredDate} onChange={e => setForm(p => ({ ...p, requiredDate: e.target.value }))} />
              </Field.Root>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Additional Requirements / Notes</Field.Label>
                <Textarea rows={4} placeholder="Certifications, brand preferences, technical needs..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </Field.Root>
              <Button type="submit" colorPalette="blue" size="lg" w="full" rounded="xl" fontWeight={700} loading={submitting}>Submit Quote Request</Button>
            </VStack>
          </Box>
        </Box>

        <Box>
          <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm" position={{ lg: 'sticky' }} top="80px">
            <Text fontWeight={700} fontSize="sm" color="gray.700" mb={3}>Selected Products ({cartItems.length})</Text>
            <VStack gap={3} align="stretch">
              {cartItems.map(item => {
                const p = products[item.productId];
                return (
                  <Flex key={item.productId} gap={3} align="center">
                    <Box bg="gray.50" rounded="lg" w="40px" h="40px" flexShrink={0} display="flex" alignItems="center" justifyContent="center" overflow="hidden">
                      {p?.imageUrl ? <img src={p.imageUrl} alt={p.name} style={{ maxHeight: 36, maxWidth: 36, objectFit: 'contain' }} /> : <Text fontSize="xs" color="gray.400">—</Text>}
                    </Box>
                    <Box flex={1} minW={0}>
                      <Text fontSize="xs" fontWeight={600} color="gray.800">{p?.name ?? item.productId}</Text>
                      <Text fontSize="xs" color="gray.500">Qty: {item.quantity}</Text>
                    </Box>
                  </Flex>
                );
              })}
            </VStack>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
