'use client';

import {
  Box, SimpleGrid, Text, Button, HStack, VStack, Flex, Badge, Checkbox,
  CheckboxGroup, Separator, Select,
  DrawerRoot, DrawerBackdrop, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseTrigger,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo, Suspense } from 'react';
import { categories, brands, products } from '@/data/mockData';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppState } from '@/context/AppContext';
import { toaster } from '@/components/ui/toaster';

const PAGE_SIZE = 9;

function CatalogueContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { dispatch } = useAppState();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category') ? [searchParams.get('category')!] : []
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brand') ? [searchParams.get('brand')!] : []
  );
  const [sort, setSort] = useState('name-asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.shortSpec.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q))
      );
    }
    if (selectedCategories.length) list = list.filter(p => selectedCategories.includes(p.categoryId));
    if (selectedBrands.length) list = list.filter(p => selectedBrands.includes(p.brandId));
    if (sort === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'name-desc') list.sort((a, b) => b.name.localeCompare(a.name));
    if (sort === 'sku') list.sort((a, b) => a.sku.localeCompare(b.sku));
    return list;
  }, [search, selectedCategories, selectedBrands, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSort('name-asc');
    setPage(1);
  };

  const addToCart = (productId: string) => {
    dispatch({ type: 'ADD_TO_CART', payload: { productId, quantity: 1 } });
    toaster.create({ title: 'Added to Quote Cart', description: 'Product added successfully.', type: 'success', duration: 2000 });
  };

  const hasFilters = search || selectedCategories.length > 0 || selectedBrands.length > 0;

  const FilterPanel = () => (
    <VStack align="stretch" gap={5}>
      <Box>
        <Text fontWeight={700} fontSize="sm" color="gray.700" mb={3}>Categories</Text>
        <VStack align="stretch" gap={2}>
          {categories.map(cat => (
            <Checkbox.Root
              key={cat.id}
              checked={selectedCategories.includes(cat.id)}
              onCheckedChange={c => {
                setSelectedCategories(prev =>
                  c.checked ? [...prev, cat.id] : prev.filter(x => x !== cat.id)
                );
                setPage(1);
              }}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>
                <Text fontSize="sm" color="gray.600">{cat.name}</Text>
              </Checkbox.Label>
            </Checkbox.Root>
          ))}
        </VStack>
      </Box>
      <Separator />
      <Box>
        <Text fontWeight={700} fontSize="sm" color="gray.700" mb={3}>Brands</Text>
        <VStack align="stretch" gap={2}>
          {brands.map(brand => (
            <Checkbox.Root
              key={brand.id}
              checked={selectedBrands.includes(brand.id)}
              onCheckedChange={c => {
                setSelectedBrands(prev =>
                  c.checked ? [...prev, brand.id] : prev.filter(x => x !== brand.id)
                );
                setPage(1);
              }}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label>
                <Text fontSize="sm" color="gray.600">{brand.name}</Text>
              </Checkbox.Label>
            </Checkbox.Root>
          ))}
        </VStack>
      </Box>
      {hasFilters && (
        <>
          <Separator />
          <Button size="sm" variant="ghost" colorPalette="red" onClick={clearFilters}>Clear All Filters</Button>
        </>
      )}
    </VStack>
  );

  return (
    <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
      {/* Breadcrumb */}
      <HStack gap={1} mb={4} fontSize="sm" color="gray.500">
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
        <Text>/</Text>
        <Text color="gray.800" fontWeight={500}>Product Catalogue</Text>
      </HStack>

      <Flex gap={6} align="flex-start">
        {/* Sidebar Desktop */}
        <Box w="240px" flexShrink={0} display={{ base: 'none', lg: 'block' }}>
          <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm" position="sticky" top="80px">
            <Text fontWeight={700} fontSize="md" color="gray.900" mb={4}>Filters</Text>
            <FilterPanel />
          </Box>
        </Box>

        {/* Main Content */}
        <Box flex={1} minW={0}>
          {/* Top Bar */}
          <Flex gap={3} mb={5} flexWrap="wrap" align="center">
            <Box flex={{ base: '1 1 100%', md: 1 }} minW={0}>
              <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search products, SKU, specs..." />
            </Box>
            <Button
              display={{ base: 'flex', lg: 'none' }}
              variant="outline"
              size="md"
              onClick={() => setFilterDrawerOpen(true)}
              flexShrink={0}
            >
              🔧 Filters {hasFilters ? `(${selectedCategories.length + selectedBrands.length})` : ''}
            </Button>
            <Box flexShrink={0}>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{
                  padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
                  background: 'white', fontSize: '14px', color: '#374151', cursor: 'pointer',
                }}
              >
                <option value="name-asc">Name A→Z</option>
                <option value="name-desc">Name Z→A</option>
                <option value="sku">SKU</option>
              </select>
            </Box>
            <HStack gap={1} flexShrink={0}>
              <Button size="sm" variant={viewMode === 'grid' ? 'solid' : 'ghost'} colorPalette={viewMode === 'grid' ? 'blue' : 'gray'} onClick={() => setViewMode('grid')}>⊞</Button>
              <Button size="sm" variant={viewMode === 'list' ? 'solid' : 'ghost'} colorPalette={viewMode === 'list' ? 'blue' : 'gray'} onClick={() => setViewMode('list')}>☰</Button>
            </HStack>
          </Flex>

          <Text fontSize="sm" color="gray.500" mb={4}>
            Showing <strong>{paginated.length}</strong> of <strong>{filtered.length}</strong> products
          </Text>

          {paginated.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No products found"
              description="Try adjusting your search or filters."
              action={<Button onClick={clearFilters} colorPalette="blue" size="sm">Clear Filters</Button>}
            />
          ) : viewMode === 'grid' ? (
            <SimpleGrid columns={{ base: 1, sm: 2, xl: 3 }} gap={5}>
              {paginated.map(product => {
                const brand = brands.find(b => b.id === product.brandId);
                return (
                  <Box key={product.id} bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden" _hover={{ shadow: 'md', borderColor: 'blue.100' }} transition="all 0.2s" display="flex" flexDirection="column">
                    <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                      <Box bg="gray.50" h="160px" display="flex" alignItems="center" justifyContent="center" overflow="hidden">
                        <img src={product.imageUrl} alt={product.name} style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'contain' }}
                          onError={(e) => { e.currentTarget.src = `https://placehold.co/280x160/e2e8f0/718096?text=${encodeURIComponent(brand?.name || '')}` }}
                        />
                      </Box>
                    </Link>
                    <Box p={4} flex={1} display="flex" flexDirection="column">
                      <HStack justify="space-between" mb={1}>
                        <Text fontSize="xs" color="blue.600" fontWeight={600}>{brand?.name}</Text>
                        <Badge colorPalette={product.isActive ? 'green' : 'gray'} variant="subtle" size="sm">
                          {product.isActive ? 'Available' : 'Enquire'}
                        </Badge>
                      </HStack>
                      <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                        <Text fontSize="sm" fontWeight={600} color="gray.800" lineHeight="short" mb={1} _hover={{ color: 'blue.600' }}>{product.name}</Text>
                      </Link>
                      <Text fontSize="xs" fontFamily="mono" color="gray.400" mb={1}>SKU: {product.sku}</Text>
                      <Text fontSize="xs" color="gray.500" mb={3} flex={1}>{product.shortSpec}</Text>
                      <Box bg="blue.50" rounded="lg" px={3} py={2} mb={3} textAlign="center">
                        <Text fontSize="xs" fontWeight={600} color="blue.700">Price available on request</Text>
                      </Box>
                      <HStack gap={2}>
                        <Link href={`/products/${product.slug}`} style={{ flex: 1, textDecoration: 'none' }}>
                          <Button variant="outline" colorPalette="blue" size="sm" w="full" rounded="lg">Details</Button>
                        </Link>
                        <Button colorPalette="blue" size="sm" rounded="lg" flex={1} onClick={() => addToCart(product.id)}>
                          + Quote
                        </Button>
                      </HStack>
                    </Box>
                  </Box>
                );
              })}
            </SimpleGrid>
          ) : (
            <VStack gap={3} align="stretch">
              {paginated.map(product => {
                const brand = brands.find(b => b.id === product.brandId);
                const cat = categories.find(c => c.id === product.categoryId);
                return (
                  <Box key={product.id} bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" p={4} _hover={{ shadow: 'md' }} transition="all 0.2s">
                    <Flex gap={4} align="center" flexWrap="wrap">
                      <Box bg="gray.50" rounded="lg" w="80px" h="80px" flexShrink={0} display="flex" alignItems="center" justifyContent="center" overflow="hidden">
                        <img src={product.imageUrl} alt={product.name} style={{ maxHeight: '70px', maxWidth: '70px', objectFit: 'contain' }}
                          onError={(e) => { e.currentTarget.src = `https://placehold.co/70x70/e2e8f0/718096?text=${encodeURIComponent(brand?.name || '')}` }}
                        />
                      </Box>
                      <Box flex={1} minW="200px">
                        <HStack gap={2} mb={1} flexWrap="wrap">
                          <Text fontSize="xs" color="blue.600" fontWeight={600}>{brand?.name}</Text>
                          <Text fontSize="xs" color="gray.400">•</Text>
                          <Text fontSize="xs" color="gray.500">{cat?.name}</Text>
                        </HStack>
                        <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                          <Text fontWeight={600} color="gray.800" fontSize="sm" _hover={{ color: 'blue.600' }}>{product.name}</Text>
                        </Link>
                        <Text fontSize="xs" fontFamily="mono" color="gray.400">SKU: {product.sku}</Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>{product.shortSpec}</Text>
                      </Box>
                      <Box textAlign="right" flexShrink={0}>
                        <Text fontSize="xs" color="blue.600" fontWeight={600} mb={2}>Price on Request</Text>
                        <HStack gap={2}>
                          <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                            <Button variant="outline" colorPalette="blue" size="sm">Details</Button>
                          </Link>
                          <Button colorPalette="blue" size="sm" onClick={() => addToCart(product.id)}>+ Quote</Button>
                        </HStack>
                      </Box>
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          )}

          <Pagination page={page} totalPages={totalPages} onChange={p => { setPage(p); window.scrollTo(0, 0); }} />
        </Box>
      </Flex>

      {/* Mobile Filter Drawer */}
      <DrawerRoot open={filterDrawerOpen} onOpenChange={d => setFilterDrawerOpen(d.open)} placement="start">
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerHeader borderBottom="1px solid" borderColor="gray.100">
            <Text fontWeight={700}>Filters</Text>
            <DrawerCloseTrigger />
          </DrawerHeader>
          <DrawerBody py={4}>
            <FilterPanel />
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </Box>
  );
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<Box p={8}><Text>Loading catalogue...</Text></Box>}>
      <CatalogueContent />
    </Suspense>
  );
}
