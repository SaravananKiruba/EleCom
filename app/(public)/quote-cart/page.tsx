'use client';

import {
  Box, Text, Button, HStack, VStack, Flex, SimpleGrid,
  Separator,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useAppState } from '@/context/AppContext';
import { products, brands } from '@/data/mockData';
import { EmptyState } from '@/components/ui/EmptyState';
import { toaster } from '@/components/ui/toaster';

export default function QuoteCartPage() {
  const { state, dispatch } = useAppState();
  const { cartItems } = state;

  const totalItems = cartItems.length;
  const totalQty = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const updateQty = (productId: string, qty: number) => {
    if (qty < 1) return;
    dispatch({ type: 'UPDATE_CART_QTY', payload: { productId, quantity: qty } });
  };

  const remove = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    toaster.create({ title: 'Removed from cart', type: 'info', duration: 1500 });
  };

  const clearAll = () => {
    dispatch({ type: 'CLEAR_CART' });
    toaster.create({ title: 'Cart cleared', type: 'info', duration: 1500 });
  };

  return (
    <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
      <HStack gap={1} mb={5} fontSize="sm" color="gray.500">
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
        <Text>/</Text>
        <Text color="gray.800" fontWeight={500}>Quote Cart</Text>
      </HStack>

      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize="2xl" fontWeight={700} color="gray.900">Quote Cart</Text>
          <Text color="gray.500" fontSize="sm" mt={0.5}>Review your products before submitting a quote request</Text>
        </Box>
        {cartItems.length > 0 && (
          <Button variant="ghost" colorPalette="red" size="sm" onClick={clearAll}>Clear All</Button>
        )}
      </Flex>

      {cartItems.length === 0 ? (
        <EmptyState
          icon="🛒"
          title="Your quote cart is empty"
          description="Browse our product catalogue and add items to request a quote."
          action={
            <Link href="/catalogue">
              <Button colorPalette="blue">Browse Products</Button>
            </Link>
          }
        />
      ) : (
        <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} alignItems="flex-start">
          {/* Cart Items */}
          <Box gridColumn={{ lg: 'span 2' }}>
            <VStack gap={4} align="stretch">
              {cartItems.map(item => {
                const product = products.find(p => p.id === item.productId);
                const brand = brands.find(b => b.id === product?.brandId);
                if (!product) return null;
                return (
                  <Box key={item.productId} bg="white" rounded="xl" p={4} border="1px solid" borderColor="gray.100" shadow="sm">
                    <Flex gap={4} align="center" flexWrap="wrap">
                      <Box bg="gray.50" rounded="lg" w="72px" h="72px" flexShrink={0} display="flex" alignItems="center" justifyContent="center" overflow="hidden">
                        <img src={product.imageUrl} alt={product.name}
                          style={{ maxHeight: '64px', maxWidth: '64px', objectFit: 'contain' }}
                          onError={(e) => {
                            e.currentTarget.src = `https://placehold.co/64x64/e2e8f0/718096?text=${encodeURIComponent(brand?.name || '')}`;
                          }}
                        />
                      </Box>
                      <Box flex={1} minW="140px">
                        <Text fontSize="xs" color="blue.600" fontWeight={600}>{brand?.name}</Text>
                        <Text fontWeight={600} color="gray.800" fontSize="sm" lineHeight="short">{product.name}</Text>
                        <Text fontSize="xs" fontFamily="mono" color="gray.400">SKU: {product.sku}</Text>
                        <Text fontSize="xs" color="gray.500" mt={0.5}>{product.shortSpec}</Text>
                      </Box>
                      <HStack gap={3} flexShrink={0} flexWrap="wrap">
                        <HStack border="1px solid" borderColor="gray.200" rounded="lg" overflow="hidden">
                          <Button size="sm" variant="ghost" onClick={() => updateQty(item.productId, item.quantity - 1)} minW="32px" h="32px" p={0} rounded="none">−</Button>
                          <Text fontWeight={600} minW="36px" textAlign="center" fontSize="sm">{item.quantity}</Text>
                          <Button size="sm" variant="ghost" onClick={() => updateQty(item.productId, item.quantity + 1)} minW="32px" h="32px" p={0} rounded="none">+</Button>
                        </HStack>
                        <Button size="sm" variant="ghost" colorPalette="red" onClick={() => remove(item.productId)} p={1}>✕</Button>
                      </HStack>
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          </Box>

          {/* Summary */}
          <Box>
            <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm" position={{ lg: 'sticky' }} top="80px">
              <Text fontWeight={700} fontSize="lg" color="gray.900" mb={4}>Summary</Text>
              <VStack gap={3} align="stretch" mb={4}>
                <Flex justify="space-between">
                  <Text fontSize="sm" color="gray.600">Products</Text>
                  <Text fontWeight={600}>{totalItems}</Text>
                </Flex>
                <Flex justify="space-between">
                  <Text fontSize="sm" color="gray.600">Total Quantity</Text>
                  <Text fontWeight={600}>{totalQty} units</Text>
                </Flex>
              </VStack>
              <Separator mb={4} />
              <Box bg="blue.50" rounded="lg" p={3} mb={4} border="1px solid" borderColor="blue.100">
                <Text fontSize="xs" color="blue.700" fontWeight={500}>
                  💰 No prices shown — submit your quote request to receive competitive pricing from our team.
                </Text>
              </Box>
              <Link href="/rfq" style={{ textDecoration: 'none' }}>
                <Button colorPalette="blue" w="full" size="lg" rounded="xl" fontWeight={700}>
                  Continue to Request Quote →
                </Button>
              </Link>
              <Link href="/catalogue" style={{ textDecoration: 'none' }}>
                <Button variant="ghost" w="full" mt={2} size="sm" colorPalette="gray">
                  ← Continue Browsing
                </Button>
              </Link>
            </Box>
          </Box>
        </SimpleGrid>
      )}
    </Box>
  );
}
