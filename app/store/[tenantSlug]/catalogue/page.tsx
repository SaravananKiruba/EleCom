'use client';

import { Box, SimpleGrid, Text, Button, HStack, Badge, VStack, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { useAppState } from '@/context/AppContext';
import { useTenantStore } from '@/context/TenantStoreContext';
import { toaster } from '@/components/ui/toaster';

interface StoreProduct {
  id: string; name: string; sku: string; slug: string;
  shortDescription?: string; imageUrl?: string; basePrice?: string;
  isFeatured: boolean;
  brand?: { name: string };
  category?: { name: string };
  variants: { id: string; name: string }[];
}

const PAGE_SIZE = 12;

function StoreCatalogueContent({ tenantSlug }: { tenantSlug: string }) {
  const store = useTenantStore();
  const { dispatch } = useAppState();
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const skip = (page - 1) * PAGE_SIZE;
    const q = search ? `&q=${encodeURIComponent(search)}` : '';
    fetch(`/api/store/${tenantSlug}/products?skip=${skip}&take=${PAGE_SIZE}${q}`)
      .then(r => r.ok ? r.json() : { products: [], total: 0 })
      .then(data => { setProducts(data.products ?? []); setTotal(data.total ?? 0); })
      .finally(() => setLoading(false));
  }, [tenantSlug, page, search]);

  const addToCart = (productId: string) => {
    dispatch({ type: 'ADD_TO_CART', payload: { productId, quantity: 1 } });
    toaster.create({ title: 'Added to quote cart', type: 'success', duration: 1500 });
  };

  return (
    <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} py={8}>
      {/* Store hero */}
      <Box bg="linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)" rounded="2xl" p={{ base: 6, md: 10 }} mb={8} color="white">
        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight={800} mb={2}>
          {store?.name ?? tenantSlug}
        </Text>
        <Text fontSize="lg" color="blue.200" mb={4}>{store?.tagline ?? 'Browse our product catalogue'}</Text>
        <HStack gap={3}>
          <Link href={`/store/${tenantSlug}/rfq`}>
            <Button colorPalette="white" variant="outline" size="sm">Request a Quote</Button>
          </Link>
        </HStack>
      </Box>

      <Flex gap={4} mb={6} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
        <Box flex={1}>
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search products..." />
        </Box>
        <Text fontSize="sm" color="gray.500" flexShrink={0}>{total} products</Text>
      </Flex>

      {loading && (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={5}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Box key={i} h="280px" bg="gray.100" rounded="xl" />
          ))}
        </SimpleGrid>
      )}

      {!loading && products.length === 0 && (
        <EmptyState
          title="No products yet"
          description="This store has not added any products yet."
          icon="📦"
        />
      )}

      {!loading && products.length > 0 && (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={5}>
          {products.map(p => (
            <Box key={p.id} bg="white" rounded="xl" border="1px solid" borderColor="gray.100"
              shadow="sm" overflow="hidden" _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
              transition="all 0.15s">
              <Link href={`/store/${tenantSlug}/products/${p.slug}`} style={{ textDecoration: 'none' }}>
                <Box h="180px" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                    : <Text fontSize="4xl">L</Text>
                  }
                </Box>
              </Link>
              <Box p={4}>
                {p.isFeatured && <Badge colorPalette="green" size="xs" mb={1}>Featured</Badge>}
                {p.brand && <Text fontSize="xs" color="gray.400" mb={1}>{p.brand.name}</Text>}
                <Link href={`/store/${tenantSlug}/products/${p.slug}`} style={{ textDecoration: 'none' }}>
                  <Text fontWeight={700} fontSize="sm" color="gray.900" lineClamp={2} mb={1}>{p.name}</Text>
                </Link>
                <Text fontSize="xs" color="gray.400" mb={3}>{p.shortDescription}</Text>
                <Button size="sm" colorPalette="green" w="full" onClick={() => addToCart(p.id)}>
                  Add to Cart
                </Button>
              </Box>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {total > PAGE_SIZE && (
        <Box mt={8}>
          <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} onChange={setPage} />
        </Box>
      )}
    </Box>
  );
}

export default async function StoreCataloguePage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  return <Suspense><StoreCatalogueContent tenantSlug={tenantSlug} /></Suspense>;
}
