'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Box, SimpleGrid, Text, Button, HStack, VStack, Flex, Separator } from '@chakra-ui/react';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppState } from '@/context/AppContext';
import { toaster } from '@/components/ui/toaster';

const PAGE_SIZE = 12;

interface Brand { id: string; name: string; }
interface Category { id: string; name: string; }
interface Product {
  id: string; name: string; slug: string; sku: string;
  shortDescription?: string | null; imageUrl?: string | null;
  brand?: Brand | null; categoryId?: string | null;
  brandId?: string | null;
}

function CatalogueContent() {
  const params = useSearchParams();
  const { dispatch } = useAppState();

  const [search, setSearch] = useState(params.get('q') ?? '');
  const [categoryFilter, setCategoryFilter] = useState<string[]>(params.get('category') ? [params.get('category')!] : []);
  const [brandFilter, setBrandFilter] = useState<string[]>(params.get('brand') ? [params.get('brand')!] : []);
  const [page, setPage] = useState(1);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/store/current/taxonomy').then(r => r.json()).then(d => {
      setBrands(d.brands ?? []);
      setCategories(d.categories ?? []);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (search) q.set('q', search);
    if (categoryFilter[0]) q.set('category', categoryFilter[0]);
    if (brandFilter[0]) q.set('brand', brandFilter[0]);
    q.set('skip', String((page - 1) * PAGE_SIZE));
    q.set('take', String(PAGE_SIZE));
    fetch(`/api/store/current/products?${q}`).then(r => r.json()).then(d => {
      setProducts(d.products ?? []);
      setTotal(d.total ?? 0);
    }).finally(() => setLoading(false));
  }, [search, categoryFilter, brandFilter, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = search || categoryFilter.length || brandFilter.length;

  const clearFilters = () => { setSearch(''); setCategoryFilter([]); setBrandFilter([]); setPage(1); };
  const addToCart = (productId: string) => {
    dispatch({ type: 'ADD_TO_CART', payload: { productId, quantity: 1 } });
    toaster.create({ title: 'Added to Quote Cart', type: 'success', duration: 2000 });
  };

  return (
    <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
      <HStack gap={1} mb={4} fontSize="sm" color="gray.500">
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
        <Text>/</Text>
        <Text color="gray.800" fontWeight={500}>Catalogue</Text>
      </HStack>

      <Flex gap={6} align="flex-start">
        <Box w="240px" flexShrink={0} display={{ base: 'none', lg: 'block' }}>
          <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm" position="sticky" top="80px">
            <Text fontWeight={700} fontSize="md" color="gray.900" mb={4}>Filters</Text>
            <VStack align="stretch" gap={5}>
              <Box>
                <Text fontWeight={700} fontSize="sm" color="gray.700" mb={2}>Category</Text>
                <select
                  value={categoryFilter[0] ?? ''}
                  onChange={e => { setCategoryFilter(e.target.value ? [e.target.value] : []); setPage(1); }}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', fontSize: 14 }}
                >
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Box>
              <Box>
                <Text fontWeight={700} fontSize="sm" color="gray.700" mb={2}>Brand</Text>
                <select
                  value={brandFilter[0] ?? ''}
                  onChange={e => { setBrandFilter(e.target.value ? [e.target.value] : []); setPage(1); }}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', fontSize: 14 }}
                >
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
          <Box mb={5}>
            <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search products, SKU..." />
          </Box>

          {loading ? (
            <Text color="gray.400" fontSize="sm">Loading products…</Text>
          ) : products.length === 0 ? (
            <EmptyState icon="📦" title="No products found" description={hasFilters ? 'Try clearing filters.' : 'This store has no products yet.'} />
          ) : (
            <>
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap={4}>
                {products.map(p => (
                  <Box key={p.id} bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden" display="flex" flexDirection="column">
                    <Link href={`/products/${p.slug}`} style={{ textDecoration: 'none' }}>
                      <Box bg="gray.50" h="180px" display="flex" alignItems="center" justifyContent="center" overflow="hidden">
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt={p.name} style={{ maxHeight: 160, maxWidth: '100%', objectFit: 'contain' }} />
                          : <Text fontSize="xs" color="gray.400">No image</Text>}
                      </Box>
                      <Box p={4}>
                        {p.brand && <Text fontSize="xs" color="blue.600" fontWeight={600}>{p.brand.name}</Text>}
                        <Text fontWeight={600} fontSize="sm" color="gray.800" mt={1}>{p.name}</Text>
                        <Text fontSize="xs" color="gray.400" mt={1} fontFamily="mono">{p.sku}</Text>
                      </Box>
                    </Link>
                    <Box p={4} pt={0}>
                      <Button size="sm" colorPalette="blue" variant="outline" w="full" onClick={() => addToCart(p.id)}>Add to Quote</Button>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}
        </Box>
      </Flex>
    </Box>
  );
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<Box p={10} textAlign="center" color="gray.400">Loading…</Box>}>
      <CatalogueContent />
    </Suspense>
  );
}
