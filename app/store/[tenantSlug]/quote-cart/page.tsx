'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, Text, Button, HStack, VStack, Flex, SimpleGrid, Separator } from '@chakra-ui/react';
import { useTenantCart } from '@/context/AppContext';
import { EmptyState } from '@/components/ui/EmptyState';
import { toaster } from '@/components/ui/toaster';

interface CartProduct {
  id: string; name: string; sku: string; slug: string; imageUrl?: string | null;
  brand?: { id: string; name: string } | null;
  shortDescription?: string | null;
}

export default function StoreQuoteCartPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = use(params);
  const cart = useTenantCart(tenantSlug);
  const [products, setProducts] = useState<Record<string, CartProduct>>({});

  useEffect(() => {
    if (cart.items.length === 0) { setProducts({}); return; }
    // Fetch the tenant's product list once and hydrate any items in the cart.
    fetch(`/api/store/${tenantSlug}/products?take=500`).then(r => r.ok ? r.json() : { products: [] }).then(d => {
      const map: Record<string, CartProduct> = {};
      (d.products ?? []).forEach((p: CartProduct) => { map[p.id] = p; });
      setProducts(map);
    });
  }, [tenantSlug, cart.items.length]);

  const totalQty = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
      <HStack gap={1} mb={5} fontSize="sm" color="gray.500">
        <Link href={`/store/${tenantSlug}/catalogue`} style={{ textDecoration: 'none', color: 'inherit' }}>Store</Link>
        <Text>/</Text>
        <Text color="gray.800" fontWeight={500}>Quote Cart</Text>
      </HStack>

      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize="2xl" fontWeight={700} color="gray.900">Quote Cart</Text>
          <Text color="gray.500" fontSize="sm">Review your products before requesting a quote.</Text>
        </Box>
        {cart.items.length > 0 && (
          <Button variant="ghost" colorPalette="red" size="sm"
            onClick={() => { cart.clear(); toaster.create({ title: 'Cart cleared', type: 'info', duration: 1500 }); }}>
            Clear All
          </Button>
        )}
      </Flex>

      {cart.items.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Your quote cart is empty"
          description="Browse the catalogue and add items to request a quote."
          action={<Link href={`/store/${tenantSlug}/catalogue`}><Button colorPalette="blue">Browse Products</Button></Link>}
        />
      ) : (
        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} alignItems="flex-start">
          <Box gridColumn={{ lg: 'span 2' }}>
            <VStack gap={4} align="stretch">
              {cart.items.map(item => {
                const p = products[item.productId];
                return (
                  <Box key={item.productId} bg="white" rounded="xl" p={4} border="1px solid" borderColor="gray.100" shadow="sm">
                    <Flex gap={4} align="center" flexWrap="wrap">
                      <Box bg="gray.50" rounded="lg" w="72px" h="72px" flexShrink={0} display="flex" alignItems="center" justifyContent="center" overflow="hidden">
                        {p?.imageUrl
                          ? <img src={p.imageUrl} alt={p.name} style={{ maxHeight: 64, maxWidth: 64, objectFit: 'contain' }} />
                          : <Text fontSize="xs" color="gray.400">—</Text>}
                      </Box>
                      <Box flex={1} minW="140px">
                        {p?.brand && <Text fontSize="xs" color="blue.600" fontWeight={600}>{p.brand.name}</Text>}
                        <Text fontWeight={600} color="gray.800" fontSize="sm">{p?.name ?? 'Loading…'}</Text>
                        <Text fontSize="xs" fontFamily="mono" color="gray.400">SKU: {p?.sku ?? '—'}</Text>
                        {p?.shortDescription && <Text fontSize="xs" color="gray.500" mt={0.5}>{p.shortDescription}</Text>}
                      </Box>
                      <HStack gap={3} flexShrink={0}>
                        <HStack border="1px solid" borderColor="gray.200" rounded="lg" overflow="hidden">
                          <Button size="sm" variant="ghost" onClick={() => cart.updateQty(item.productId, Math.max(1, item.quantity - 1))} minW="32px" h="32px" p={0} rounded="none">−</Button>
                          <Text fontWeight={600} minW="36px" textAlign="center">{item.quantity}</Text>
                          <Button size="sm" variant="ghost" onClick={() => cart.updateQty(item.productId, item.quantity + 1)} minW="32px" h="32px" p={0} rounded="none">+</Button>
                        </HStack>
                        <Button size="sm" variant="ghost" colorPalette="red"
                          onClick={() => { cart.remove(item.productId); toaster.create({ title: 'Removed from cart', type: 'info', duration: 1500 }); }}>
                          ✕
                        </Button>
                      </HStack>
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          </Box>

          <Box>
            <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm" position={{ lg: 'sticky' }} top="80px">
              <Text fontWeight={700} fontSize="lg" mb={4}>Summary</Text>
              <VStack gap={3} align="stretch" mb={4}>
                <Flex justify="space-between"><Text fontSize="sm" color="gray.600">Products</Text><Text fontWeight={600}>{cart.items.length}</Text></Flex>
                <Flex justify="space-between"><Text fontSize="sm" color="gray.600">Total Qty</Text><Text fontWeight={600}>{totalQty} units</Text></Flex>
              </VStack>
              <Separator mb={4} />
              <Link href={`/store/${tenantSlug}/rfq`}>
                <Button colorPalette="blue" w="full" size="lg" rounded="xl" fontWeight={700}>Request Quote →</Button>
              </Link>
              <Text fontSize="xs" color="gray.500" mt={2} textAlign="center">Sign in required only at submit</Text>
            </Box>
          </Box>
        </SimpleGrid>
      )}
    </Box>
  );
}
