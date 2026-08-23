'use client';

import {
  Box, Text, Button, HStack, VStack, Flex, SimpleGrid, Input, Textarea, Field, Badge,
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogCloseTrigger,
} from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import { products as allProducts, brands, categories } from '@/data/mockData';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { toaster } from '@/components/ui/toaster';

const PAGE_SIZE = 10;

export default function AdminProductsPage() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'form'>('table');
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = [...allProducts];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }
    if (catFilter) list = list.filter(p => p.categoryId === catFilter);
    if (brandFilter) list = list.filter(p => p.brandId === brandFilter);
    if (statusFilter) list = list.filter(p => (statusFilter === 'active' ? p.isActive : !p.isActive));
    return list;
  }, [search, catFilter, brandFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = search || catFilter || brandFilter || statusFilter;
  const clearFilters = () => { setSearch(''); setCatFilter(''); setBrandFilter(''); setStatusFilter(''); setPage(1); };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader
        title="Products"
        subtitle={`${allProducts.length} products`}
        actions={<Button colorPalette="blue" size="sm" onClick={() => setFormOpen(true)}>+ Add Product</Button>}
      />

      <Flex gap={3} mb={5} flexWrap="wrap">
        <Box flex={{ base: '1 1 100%', md: 1 }} minW={0}>
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search product name, SKU..." />
        </Box>
        {[
          {
            value: catFilter, onChange: (v: string) => { setCatFilter(v); setPage(1); },
            options: [{ v: '', l: 'All Categories' }, ...categories.map(c => ({ v: c.id, l: c.name }))],
          },
          {
            value: brandFilter, onChange: (v: string) => { setBrandFilter(v); setPage(1); },
            options: [{ v: '', l: 'All Brands' }, ...brands.map(b => ({ v: b.id, l: b.name }))],
          },
          {
            value: statusFilter, onChange: (v: string) => { setStatusFilter(v); setPage(1); },
            options: [{ v: '', l: 'All Status' }, { v: 'active', l: 'Active' }, { v: 'inactive', l: 'Inactive' }],
          },
        ].map((sel, i) => (
          <select key={i} value={sel.value} onChange={e => sel.onChange(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '14px', color: '#374151', cursor: 'pointer', minWidth: '140px' }}>
            {sel.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        ))}
        {hasFilters && <Button size="md" variant="ghost" colorPalette="gray" onClick={clearFilters}>Clear</Button>}
      </Flex>

      {paginated.length === 0 ? (
        <EmptyState icon="📦" title="No products found" action={hasFilters ? <Button onClick={clearFilters} size="sm">Clear Filters</Button> : undefined} />
      ) : (
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: '750px' }}>
              <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Box as="tr">
                  {['Image', 'Product', 'SKU', 'Category', 'Brand', 'Status'].map(h => (
                    <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide" whiteSpace="nowrap">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {paginated.map(p => {
                  const brand = brands.find(b => b.id === p.brandId);
                  const cat = categories.find(c => c.id === p.categoryId);
                  return (
                    <Box as="tr" key={p.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'gray.50' }}>
                      <Box as="td" px={4} py={3}>
                        <Box bg="gray.50" rounded="lg" w="44px" h="44px" display="flex" alignItems="center" justifyContent="center" overflow="hidden">
                          <img src={p.imageUrl} alt={p.name}
                            style={{ maxHeight: '38px', maxWidth: '38px', objectFit: 'contain' }}
                            onError={(e) => { e.currentTarget.src = `https://placehold.co/38x38/e2e8f0/718096?text=P` }}
                          />
                        </Box>
                      </Box>
                      <Box as="td" px={4} py={3}>
                        <Text fontSize="sm" fontWeight={600} color="gray.800">{p.name}</Text>
                        <Text fontSize="xs" color="gray.500">{p.shortSpec}</Text>
                      </Box>
                      <Box as="td" px={4} py={3}><Text fontSize="xs" fontFamily="mono" color="gray.600">{p.sku}</Text></Box>
                      <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.600">{cat?.name}</Text></Box>
                      <Box as="td" px={4} py={3}><Text fontSize="xs" color="blue.600" fontWeight={600}>{brand?.name}</Text></Box>
                      <Box as="td" px={4} py={3}>
                        <Badge colorPalette={p.isActive ? 'green' : 'gray'} variant="subtle" size="sm">{p.isActive ? 'Active' : 'Inactive'}</Badge>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* Add Product Dialog */}
      <DialogRoot open={formOpen} onOpenChange={d => setFormOpen(d.open)} size="lg">
        <DialogBackdrop />
        <DialogContent maxW={{ base: '95vw', md: '520px' }} mx="auto">
          <DialogHeader><Text fontWeight={700}>Add Product</Text><DialogCloseTrigger /></DialogHeader>
          <DialogBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              {[
                { label: 'Product Name', ph: 'Philips LED Panel 36W' },
                { label: 'SKU', ph: 'PHL-PNL-36W' },
                { label: 'Brand', ph: 'Select brand' },
                { label: 'Category', ph: 'Select category' },
                { label: 'Short Specification', ph: '36W | 4000K | 600x600mm' },
              ].map(f => (
                <Field.Root key={f.label}>
                  <Field.Label fontSize="sm" fontWeight={600}>{f.label}</Field.Label>
                  <Input placeholder={f.ph} />
                </Field.Root>
              ))}
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Description</Field.Label>
                <Textarea placeholder="Product description..." rows={3} />
              </Field.Root>
            </SimpleGrid>
          </DialogBody>
          <DialogFooter gap={3}>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button colorPalette="blue" onClick={() => { setFormOpen(false); toaster.create({ title: 'Product saved (demo)', type: 'success', duration: 2000 }); }}>Save Product</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
}
