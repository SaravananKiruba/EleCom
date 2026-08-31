'use client';

import { Box, SimpleGrid, Text, Button, Badge, VStack, Flex, Separator } from '@chakra-ui/react';
import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { useTenantCart } from '@/context/AppContext';
import { useTenantStore } from '@/context/TenantStoreContext';
import { toaster } from '@/components/ui/toaster';

interface StoreProduct {
  id: string; name: string; sku: string; slug: string;
  shortDescription?: string; imageUrl?: string; basePrice?: string;
  isFeatured: boolean;
  brand?: { id: string; name: string };
  category?: { id: string; name: string };
  variants: { id: string; name: string }[];
}

interface Brand { id: string; name: string; }
interface Category { id: string; name: string; }

const PAGE_SIZE = 12;

function StoreCatalogueContent({ tenantSlug }: { tenantSlug: string }) {
  const store = useTenantStore();
  const cart = useTenantCart(tenantSlug);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/store/${tenantSlug}/taxonomy`).then(r => r.ok ? r.json() : { brands: [], categories: [] }).then(d => {
      setBrands(d.brands ?? []);
      setCategories(d.categories ?? []);
    });
  }, [tenantSlug]);

  useEffect(() => {
    setLoading(true);
    const skip = (page - 1) * PAGE_SIZE;
    const q = new URLSearchParams({ skip: String(skip), take: String(PAGE_SIZE) });
    if (search) q.set('q', search);
    if (brandFilter) q.set('brand', brandFilter);
    if (categoryFilter) q.set('category', categoryFilter);
    fetch(`/api/store/${tenantSlug}/products?${q}`)
      .then(r => r.ok ? r.json() : { products: [], total: 0 })
      .then(data => { setProducts(data.products ?? []); setTotal(data.total ?? 0); })
      .finally(() => setLoading(false));
  }, [tenantSlug, page, search, brandFilter, categoryFilter]);

  const addToCart = (p: StoreProduct) => {
    cart.add({ productId: p.id, quantity: 1 });
    toaster.create({ title: `Added ${p.name} to quote cart`, type: 'success', duration: 1500 });
  };

  const clearFilters = () => { setSearch(''); setBrandFilter(''); setCategoryFilter(''); setPage(1); };
  const hasFilters = search || brandFilter || categoryFilter;
  const primary = store?.primaryColor ?? '#6b8375';

  return (
    <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
      <Box bg={`linear-gradient(135deg, ${primary} 0%, #37463e 100%)`} rounded="2xl" p={{ base: 6, md: 10 }} mb={8} color="white">
        <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight={800} mb={2}>{store?.name ?? tenantSlug}</Text>
        <Text fontSize="lg" opacity={0.9} mb={4}>{store?.tagline ?? 'Browse our product catalogue'}</Text>
      </Box>

      <Flex gap={6} align="flex-start">
        <Box w="240px" flexShrink={0} display={{ base: 'none', lg: 'block' }}>
          <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm" position="sticky" top="80px">
            <Text fontWeight={700} fontSize="md" color="gray.900" mb={4}>Filters</Text>
            <VStack align="stretch" gap={5}>
              <Box>
                <Text fontWeight={700} fontSize="sm" color="gray.700" mb={2}>Category</Text>
                <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', width: '100%', fontSize: 14 }}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Box>
              <Box>
                <Text fontWeight={700} fontSize="sm" color="gray.700" mb={2}>Brand</Text>
                <select value={brandFilter} onChange={e => { setBrandFilter(e.target.value); setPage(1); }}
                  style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', width: '100%', fontSize: 14 }}>
                  <option value="">All Brands</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </Box>
              {hasFilters && (
                <>
                  <Separator />
                  <Button size="sm" variant="ghost" colorPalette="red" onClick={clearFilters}>Clear Filters</Button>
                </>
              )}
            </VStack>
          </Box>
        </Box>

        <Box flex={1} minW={0}>
          <Flex gap={4} mb={6} direction={{ base: 'column', md: 'row' }} align={{ md: 'center' }}>
            <Box flex={1}>
              <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search products..." />
            </Box>
            <Text fontSize="sm" color="gray.500" flexShrink={0}>{total} products</Text>
          </Flex>

          {loading && (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={5}>
              {Array.from({ length: 6 }).map((_, i) => <Box key={i} h="280px" bg="gray.100" rounded="xl" />)}
            </SimpleGrid>
          )}

          {!loading && products.length === 0 && (
            <EmptyState title="No products found" description={hasFilters ? 'Try clearing filters.' : 'This store has not added any products yet.'} icon="📦" />
          )}

          {!loading && products.length > 0 && (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={5}>
              {products.map(p => (
                <Box key={p.id} bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden"
                  _hover={{ shadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.15s">
                  <Link href={`/store/${tenantSlug}/products/${p.slug}`} style={{ textDecoration: 'none' }}>
                    <Box h="180px" bg="gray.50" display="flex" alignItems="center" justifyContent="center">
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                        : <Text fontSize="4xl">💡</Text>}
                    </Box>
                  </Link>
                  <Box p={4}>
                    {p.isFeatured && <Badge colorPalette="green" size="xs" mb={1}>Featured</Badge>}
                    {p.brand && <Text fontSize="xs" color="gray.400" mb={1}>{p.brand.name}</Text>}
                    <Link href={`/store/${tenantSlug}/products/${p.slug}`} style={{ textDecoration: 'none' }}>
                      <Text fontWeight={700} fontSize="sm" color="gray.900" lineClamp={2} mb={1}>{p.name}</Text>
                    </Link>
                    <Text fontSize="xs" color="gray.400" mb={3}>{p.shortDescription}</Text>
                    <Button size="sm" colorPalette="green" w="full" onClick={() => addToCart(p)}>Add to Quote Cart</Button>
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
      </Flex>
    </Box>
  );
}

export default async function StoreCataloguePage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  return <Suspense><StoreCatalogueContent tenantSlug={tenantSlug} /></Suspense>;
}
