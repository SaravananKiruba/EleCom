'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, Button, Flex, HStack, Text, SimpleGrid, VStack, Separator } from '@chakra-ui/react';
import { useTenantCart } from '@/context/AppContext';
import { toaster } from '@/components/ui/toaster';
import { EmptyState } from '@/components/ui/EmptyState';

interface Brand { id: string; name: string; }
interface Product {
  id: string; name: string; slug: string; sku: string;
  shortDescription?: string | null; description?: string | null; imageUrl?: string | null;
  brand?: Brand | null;
  specifications?: { specKey: string; specValue: string; unit?: string | null }[];
  documents?: { id: string; name: string; fileUrl: string }[];
}

export default function StoreProductDetailPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; slug: string }>;
}) {
  const { tenantSlug, slug } = use(params);
  const cart = useTenantCart(tenantSlug);
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/store/${tenantSlug}/products/${slug}`).then(async r => {
      if (r.status === 404) { setNotFound(true); return; }
      const p = await r.json();
      setProduct(p);
    }).finally(() => setLoading(false));
  }, [tenantSlug, slug]);

  if (loading) return <Box p={10} textAlign="center" color="gray.400">Loading…</Box>;
  if (notFound || !product) {
    return (
      <Box maxW="720px" mx="auto" py={20} px={6}>
        <EmptyState icon="🔍" title="Product not found"
          action={<Link href={`/store/${tenantSlug}/catalogue`}><Button colorPalette="blue">Back to catalogue</Button></Link>} />
      </Box>
    );
  }

  const addToCart = () => {
    cart.add({ productId: product.id, quantity: qty });
    toaster.create({ title: `Added ${product.name} to quote cart`, type: 'success', duration: 2000 });
  };

  return (
    <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
      <HStack gap={1} mb={5} fontSize="sm" color="gray.500">
        <Link href={`/store/${tenantSlug}/catalogue`} style={{ textDecoration: 'none', color: 'inherit' }}>Store</Link>
        <Text>/</Text>
        <Link href={`/store/${tenantSlug}/catalogue`} style={{ textDecoration: 'none', color: 'inherit' }}>Catalogue</Link>
        <Text>/</Text>
        <Text color="gray.800" fontWeight={500}>{product.name}</Text>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={8} alignItems="flex-start">
        <Box bg="white" rounded="xl" p={6} border="1px solid" borderColor="gray.100" shadow="sm" minH="360px" display="flex" alignItems="center" justifyContent="center">
          {product.imageUrl
            ? <img src={product.imageUrl} alt={product.name} style={{ maxHeight: 320, maxWidth: '100%', objectFit: 'contain' }} />
            : <Text color="gray.400">No image</Text>}
        </Box>

        <Box>
          {product.brand && <Text fontSize="xs" color="blue.600" fontWeight={600} mb={1}>{product.brand.name}</Text>}
          <Text fontSize="2xl" fontWeight={800} color="gray.900" mb={2}>{product.name}</Text>
          <Text fontSize="xs" color="gray.400" fontFamily="mono" mb={4}>SKU: {product.sku}</Text>
          {product.shortDescription && <Text color="gray.600" mb={4}>{product.shortDescription}</Text>}
          {product.description && <Text color="gray.600" fontSize="sm" mb={5} whiteSpace="pre-line">{product.description}</Text>}

          <Flex gap={3} align="center" mb={5}>
            <HStack border="1px solid" borderColor="gray.200" rounded="lg" overflow="hidden">
              <Button size="sm" variant="ghost" onClick={() => setQty(q => Math.max(1, q - 1))}>−</Button>
              <Text fontWeight={600} minW="36px" textAlign="center">{qty}</Text>
              <Button size="sm" variant="ghost" onClick={() => setQty(q => q + 1)}>+</Button>
            </HStack>
            <Button colorPalette="green" onClick={addToCart} flex={1}>Add to Quote Cart</Button>
          </Flex>

          {product.specifications && product.specifications.length > 0 && (
            <Box mt={6}>
              <Text fontWeight={700} fontSize="sm" color="gray.700" mb={3}>Specifications</Text>
              <VStack align="stretch" gap={2}>
                {product.specifications.map((s, i) => (
                  <Flex key={i} justify="space-between" bg="gray.50" rounded="lg" px={3} py={2}>
                    <Text fontSize="sm" color="gray.500">{s.specKey}</Text>
                    <Text fontSize="sm" fontWeight={600} color="gray.800">{s.specValue}{s.unit ? ` ${s.unit}` : ''}</Text>
                  </Flex>
                ))}
              </VStack>
            </Box>
          )}

          {product.documents && product.documents.length > 0 && (
            <Box mt={6}>
              <Separator mb={4} />
              <Text fontWeight={700} fontSize="sm" color="gray.700" mb={3}>Documents</Text>
              <VStack align="stretch" gap={2}>
                {product.documents.map(doc => (
                  <a key={doc.id} href={doc.fileUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                    <Flex justify="space-between" bg="gray.50" rounded="lg" px={3} py={2} _hover={{ bg: 'gray.100' }}>
                      <Text fontSize="sm" color="blue.700">{doc.name}</Text>
                      <Text fontSize="xs" color="gray.400">↓</Text>
                    </Flex>
                  </a>
                ))}
              </VStack>
            </Box>
          )}
        </Box>
      </SimpleGrid>
    </Box>
  );
}
