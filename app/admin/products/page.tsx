'use client';

import {
  Box, Text, Button, HStack, Flex, Badge, Input, Textarea, Field,
  SimpleGrid, VStack, Separator,
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogCloseTrigger,
  Switch,
} from '@chakra-ui/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { toaster } from '@/components/ui/toaster';
import * as XLSX from 'xlsx';

const PAGE_SIZE = 20;

interface Brand { id: string; name: string; slug: string; }
interface Category { id: string; name: string; slug: string; children?: Category[]; }
interface Spec { specKey: string; specValue: string; unit?: string; sortOrder?: number; }
interface Variant { id?: string; sku: string; name: string; price: string; stockQuantity: string; }
interface Product {
  id: string; name: string; sku: string; slug: string;
  shortDescription?: string; description?: string; imageUrl?: string;
  basePrice?: string | null; status: string; isFeatured: boolean;
  brand?: Brand | null; category?: Category | null;
  specifications: Spec[];
}

const EMPTY_FORM = {
  name: '', sku: '', brandId: '', categoryId: '',
  shortDescription: '', description: '', imageUrl: '',
  basePrice: '', status: 'ACTIVE', isFeatured: false,
  specs: [{ specKey: '', specValue: '', unit: '' }] as { specKey: string; specValue: string; unit: string }[],
  variants: [] as Variant[],
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'green', DRAFT: 'gray', INACTIVE: 'orange', ARCHIVED: 'red',
};

export default function AdminProductsPage() {
  const { user } = useAuth();
  const tenantId = user.tenantId;

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<Record<string, string>[]>([]);
  const [importFilename, setImportFilename] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchProducts = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const skip = (page - 1) * PAGE_SIZE;
      const q = new URLSearchParams({ tenantId, skip: String(skip), take: String(PAGE_SIZE) });
      if (search) q.set('search', search);
      if (catFilter) q.set('categoryId', catFilter);
      if (brandFilter) q.set('brandId', brandFilter);
      if (statusFilter) q.set('status', statusFilter);
      const res = await fetch(`/api/products?${q}`);
      const data = await res.json();
      setProducts(data.products ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [tenantId, page, search, catFilter, brandFilter, statusFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (!tenantId) return;
    Promise.all([
      fetch(`/api/brands?tenantId=${tenantId}`).then(r => r.json()),
      fetch(`/api/categories?tenantId=${tenantId}`).then(r => r.json()),
    ]).then(([b, c]) => { setBrands(b); setCategories(c); });
  }, [tenantId]);

  const openCreate = () => {
    setEditProduct(null);
    setForm({ ...EMPTY_FORM, specs: [{ specKey: '', specValue: '', unit: '' }] });
    setFormOpen(true);
  };

  const openEdit = async (p: Product) => {
    setEditProduct(p);
    // Load variants for this product
    let loadedVariants: Variant[] = [];
    if (tenantId) {
      try {
        const vdata = await fetch(`/api/products/${p.id}/variants?tenantId=${tenantId}`).then(r => r.json());
        loadedVariants = (Array.isArray(vdata) ? vdata : []).map((v: { sku: string; name: string; price?: string | null; stockQuantity?: number | null }) => ({
          sku: v.sku, name: v.name,
          price: v.price != null ? String(v.price) : '',
          stockQuantity: v.stockQuantity != null ? String(v.stockQuantity) : '',
        }));
      } catch {}
    }
    setForm({
      name: p.name,
      sku: p.sku,
      brandId: p.brand?.id ?? '',
      categoryId: p.category?.id ?? '',
      shortDescription: p.shortDescription ?? '',
      description: p.description ?? '',
      imageUrl: p.imageUrl ?? '',
      basePrice: p.basePrice != null ? String(p.basePrice) : '',
      status: p.status,
      isFeatured: p.isFeatured,
      specs: p.specifications.length
        ? p.specifications.map(s => ({ specKey: s.specKey, specValue: s.specValue, unit: s.unit ?? '' }))
        : [{ specKey: '', specValue: '', unit: '' }],
      variants: loadedVariants,
    });
    setFormOpen(true);
  };

  const setSpecField = (i: number, field: 'specKey' | 'specValue' | 'unit', val: string) => {
    setForm(f => {
      const specs = [...f.specs];
      specs[i] = { ...specs[i], [field]: val };
      return { ...f, specs };
    });
  };

  const addSpec = () => setForm(f => ({ ...f, specs: [...f.specs, { specKey: '', specValue: '', unit: '' }] }));
  const removeSpec = (i: number) => setForm(f => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!tenantId || !form.name.trim() || !form.sku.trim()) {
      toaster.create({ title: 'Name and SKU are required', type: 'error', duration: 3000 });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        tenantId,
        name: form.name.trim(),
        sku: form.sku.trim(),
        brandId: form.brandId || null,
        categoryId: form.categoryId || null,
        shortDescription: form.shortDescription.trim() || null,
        description: form.description.trim() || null,
        imageUrl: form.imageUrl.trim() || null,
        basePrice: form.basePrice ? parseFloat(form.basePrice) : null,
        status: form.status,
        isFeatured: form.isFeatured,
        specifications: form.specs
          .filter(s => s.specKey.trim() && s.specValue.trim())
          .map((s, i) => ({ specKey: s.specKey.trim(), specValue: s.specValue.trim(), unit: s.unit.trim() || undefined, sortOrder: i })),
      };
      const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products';
      const method = editProduct ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? 'Save failed');
      }
      toaster.create({ title: editProduct ? 'Product updated' : 'Product created', type: 'success', duration: 2000 });

      // Save variants if any are defined
      const savedProduct = await res.json();
      if (form.variants.length > 0) {
        const vPayload = form.variants.filter(v => v.sku.trim() && v.name.trim()).map(v => ({
          sku: v.sku.trim(), name: v.name.trim(),
          price: v.price ? parseFloat(v.price) : null,
          stockQuantity: v.stockQuantity ? parseInt(v.stockQuantity) : null,
        }));
        if (vPayload.length > 0) {
          await fetch(`/api/products/${editProduct?.id ?? savedProduct.id}/variants`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenantId, variants: vPayload }),
          });
        }
      }

      setFormOpen(false);
      fetchProducts();
    } catch (err) {
      toaster.create({ title: (err as Error).message, type: 'error', duration: 4000 });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!tenantId || !deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteTarget.id}?tenantId=${tenantId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toaster.create({ title: 'Product deleted', type: 'success', duration: 2000 });
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      toaster.create({ title: 'Delete failed', type: 'error', duration: 3000 });
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (p: Product) => {
    if (!tenantId) return;
    const nextStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await fetch(`/api/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, status: nextStatus }),
    });
    fetchProducts();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFilename(file.name);
    setImportResult(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const wb = XLSX.read(data, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
      setImportRows(rows);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!tenantId || importRows.length === 0) return;
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch('/api/products/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, rows: importRows }),
      });
      const result = await res.json();
      setImportResult(result);
      if (result.created > 0) {
        toaster.create({ title: `${result.created} products imported`, type: 'success', duration: 3000 });
        fetchProducts();
      }
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['name', 'sku', 'brandName', 'categoryName', 'shortDescription', 'description', 'imageUrl', 'basePrice', 'status', 'specKeys', 'specValues'],
      ['LED Panel 36W', 'LED-PNL-36W', 'Philips', 'LED Panels', '36W Surface Panel', 'Full description here', '', '2500', 'ACTIVE', 'Wattage|Color Temp|IP Rating', '36W|4000K|IP54'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');
    XLSX.writeFile(wb, 'product_import_template.xlsx');
  };

  const clearFilters = () => { setSearch(''); setCatFilter(''); setBrandFilter(''); setStatusFilter(''); setPage(1); };
  const hasFilters = search || catFilter || brandFilter || statusFilter;

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader
        title="Products"
        subtitle={`${total} products`}
        actions={
          <HStack gap={2}>
            <Button size="sm" variant="outline" colorPalette="green" onClick={() => { setImportOpen(true); setImportRows([]); setImportFilename(''); setImportResult(null); }}>
              ↑ Bulk Import
            </Button>
            <Button colorPalette="blue" size="sm" onClick={openCreate}>+ Add Product</Button>
          </HStack>
        }
      />

      <Flex gap={3} mb={5} flexWrap="wrap">
        <Box flex={{ base: '1 1 100%', md: 1 }} minW={0}>
          <SearchInput value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search name, SKU..." />
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
            options: [
              { v: '', l: 'All Status' },
              { v: 'ACTIVE', l: 'Active' }, { v: 'DRAFT', l: 'Draft' },
              { v: 'INACTIVE', l: 'Inactive' }, { v: 'ARCHIVED', l: 'Archived' },
            ],
          },
        ].map((sel, i) => (
          <select key={i} value={sel.value} onChange={e => sel.onChange(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '14px', color: '#374151', cursor: 'pointer', minWidth: '140px' }}>
            {sel.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        ))}
        {hasFilters && <Button size="md" variant="ghost" colorPalette="gray" onClick={clearFilters}>Clear</Button>}
      </Flex>

      {loading ? (
        <Box py={10} textAlign="center"><Text color="gray.400">Loading...</Text></Box>
      ) : products.length === 0 ? (
        <EmptyState icon="📦" title="No products found"
          action={hasFilters
            ? <Button size="sm" onClick={clearFilters}>Clear Filters</Button>
            : <Button size="sm" colorPalette="blue" onClick={openCreate}>Add First Product</Button>
          }
        />
      ) : (
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: '820px' }}>
              <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Box as="tr">
                  {['Product', 'SKU', 'Category', 'Brand', 'Price', 'Status', 'Actions'].map(h => (
                    <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide" whiteSpace="nowrap">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {products.map(p => (
                  <Box as="tr" key={p.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'gray.50' }} onClick={() => openEdit(p)} style={{ cursor: 'pointer' }}>
                    <Box as="td" px={4} py={3}>
                      <Text fontSize="sm" fontWeight={600} color="gray.800">{p.name}</Text>
                      {p.shortDescription && <Text fontSize="xs" color="gray.500">{p.shortDescription}</Text>}
                    </Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" fontFamily="mono" color="gray.600">{p.sku}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.600">{p.category?.name ?? '—'}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" color="blue.600" fontWeight={600}>{p.brand?.name ?? '—'}</Text></Box>
                    <Box as="td" px={4} py={3}>
                      <Text fontSize="sm" fontWeight={600} color="gray.800">
                        {p.basePrice != null ? `₹${Number(p.basePrice).toLocaleString('en-IN')}` : '—'}
                      </Text>
                    </Box>
                    <Box as="td" px={4} py={3} onClick={e => { e.stopPropagation(); toggleStatus(p); }}>
                      <Badge colorPalette={STATUS_COLORS[p.status] ?? 'gray'} variant="subtle" size="sm" style={{ cursor: 'pointer' }}>{p.status}</Badge>
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <HStack gap={2} onClick={e => e.stopPropagation()}>
                        <Button size="xs" variant="ghost" colorPalette="blue" onClick={() => openEdit(p)}>Edit</Button>
                        <Button size="xs" variant="ghost" colorPalette="red" onClick={() => setDeleteTarget(p)}>Delete</Button>
                      </HStack>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* Add / Edit Dialog */}
      <DialogRoot open={formOpen} onOpenChange={d => setFormOpen(d.open)} size="xl">
        <DialogBackdrop />
        <DialogContent maxW={{ base: '95vw', md: '720px' }} mx="auto">
          <DialogHeader>
            <Text fontWeight={700}>{editProduct ? 'Edit Product' : 'Add Product'}</Text>
            <DialogCloseTrigger />
          </DialogHeader>
          <DialogBody>
            <VStack gap={5} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Field.Root required>
                  <Field.Label fontSize="sm" fontWeight={600}>Product Name <Text as="span" color="red.500">*</Text></Field.Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. LED Panel 36W" />
                </Field.Root>
                <Field.Root required>
                  <Field.Label fontSize="sm" fontWeight={600}>SKU <Text as="span" color="red.500">*</Text></Field.Label>
                  <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="e.g. CVS-PNL-36W" fontFamily="mono" />
                </Field.Root>
                <Field.Root>
                  <Field.Label fontSize="sm" fontWeight={600}>Brand</Field.Label>
                  <select value={form.brandId} onChange={e => setForm(f => ({ ...f, brandId: e.target.value }))}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '14px', color: '#374151', width: '100%' }}>
                    <option value="">— No Brand —</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </Field.Root>
                <Field.Root>
                  <Field.Label fontSize="sm" fontWeight={600}>Category</Field.Label>
                  <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '14px', color: '#374151', width: '100%' }}>
                    <option value="">— No Category —</option>
                    {categories.map(c => (
                      <optgroup key={c.id} label={c.name}>
                        <option value={c.id}>{c.name}</option>
                        {c.children?.map(sub => <option key={sub.id} value={sub.id}>  └ {sub.name}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </Field.Root>
                <Field.Root>
                  <Field.Label fontSize="sm" fontWeight={600}>Base Price (₹)</Field.Label>
                  <Input type="number" value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))} placeholder="e.g. 2500" />
                </Field.Root>
                <Field.Root>
                  <Field.Label fontSize="sm" fontWeight={600}>Status</Field.Label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '14px', color: '#374151', width: '100%' }}>
                    <option value="ACTIVE">Active</option>
                    <option value="DRAFT">Draft</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </Field.Root>
              </SimpleGrid>

              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Short Description</Field.Label>
                <Input value={form.shortDescription} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} placeholder="e.g. 36W | 4000K | 600×600mm" />
              </Field.Root>

              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Full Description</Field.Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Detailed product description..." rows={3} />
              </Field.Root>

              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Image URL</Field.Label>
                <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://cdn.example.com/product.jpg" />
                {form.imageUrl && (
                  <Box mt={2}>
                    <img src={form.imageUrl} alt="preview"
                      style={{ height: '80px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </Box>
                )}
              </Field.Root>

              <Flex align="center" gap={3}>
                <Switch.Root checked={form.isFeatured} onCheckedChange={d => setForm(f => ({ ...f, isFeatured: d.checked }))} colorPalette="blue">
                  <Switch.Control><Switch.Thumb /></Switch.Control>
                  <Switch.Label fontSize="sm" fontWeight={600}>Featured product</Switch.Label>
                </Switch.Root>
              </Flex>

              <Box>
                <Flex align="center" justify="space-between" mb={3}>
                  <Text fontSize="sm" fontWeight={700} color="gray.700">Specifications</Text>
                  <Button size="xs" variant="ghost" colorPalette="blue" onClick={addSpec}>+ Add Row</Button>
                </Flex>
                <VStack gap={2} align="stretch">
                  {form.specs.map((s, i) => (
                    <HStack key={i} gap={2}>
                      <Input size="sm" value={s.specKey} onChange={e => setSpecField(i, 'specKey', e.target.value)} placeholder="Key (e.g. Wattage)" flex={2} />
                      <Input size="sm" value={s.specValue} onChange={e => setSpecField(i, 'specValue', e.target.value)} placeholder="Value (e.g. 36W)" flex={2} />
                      <Input size="sm" value={s.unit} onChange={e => setSpecField(i, 'unit', e.target.value)} placeholder="Unit" flex={1} />
                      <Button size="xs" variant="ghost" colorPalette="red" onClick={() => removeSpec(i)} disabled={form.specs.length === 1}>✕</Button>
                    </HStack>
                  ))}
                </VStack>
              </Box>

              {/* Variants & Stock */}
              <Box>
                <Flex align="center" justify="space-between" mb={3}>
                  <Text fontSize="sm" fontWeight={700} color="gray.700">Variants & Stock</Text>
                  <Button size="xs" variant="ghost" colorPalette="blue" onClick={() => setForm(f => ({ ...f, variants: [...f.variants, { sku: '', name: '', price: '', stockQuantity: '' }] }))}>
                    + Add Variant
                  </Button>
                </Flex>
                <Box mb={1}>
                  <HStack gap={2} mb={1}>
                    {['SKU', 'Variant Name', 'Price (₹)', 'Stock Qty', ''].map(h => (
                      <Text key={h} fontSize="10px" fontWeight={700} color="gray.500" textTransform="uppercase" flex={h === '' ? 0 : 1} w={h === '' ? '28px' : undefined}>{h}</Text>
                    ))}
                  </HStack>
                  <VStack gap={2} align="stretch">
                    {form.variants.map((v, i) => (
                      <HStack key={i} gap={2}>
                        <Input size="sm" value={v.sku} onChange={e => setForm(f => { const variants = [...f.variants]; variants[i] = { ...variants[i], sku: e.target.value }; return { ...f, variants }; })} placeholder="VAR-001" flex={1} fontFamily="mono" />
                        <Input size="sm" value={v.name} onChange={e => setForm(f => { const variants = [...f.variants]; variants[i] = { ...variants[i], name: e.target.value }; return { ...f, variants }; })} placeholder="e.g. Cool White 4000K" flex={1} />
                        <Input size="sm" type="number" value={v.price} onChange={e => setForm(f => { const variants = [...f.variants]; variants[i] = { ...variants[i], price: e.target.value }; return { ...f, variants }; })} placeholder="0" flex={1} />
                        <Input size="sm" type="number" value={v.stockQuantity} onChange={e => setForm(f => { const variants = [...f.variants]; variants[i] = { ...variants[i], stockQuantity: e.target.value }; return { ...f, variants }; })} placeholder="0" flex={1} />
                        <Button size="xs" variant="ghost" colorPalette="red" w="28px" onClick={() => setForm(f => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }))}>✕</Button>
                      </HStack>
                    ))}
                    {form.variants.length === 0 && <Text fontSize="xs" color="gray.400">No variants — product treated as single SKU</Text>}
                  </VStack>
                </Box>
              </Box>
            </VStack>
          </DialogBody>
          <DialogFooter gap={3}>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button colorPalette="blue" onClick={handleSave} loading={saving}>
              {editProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Delete Confirm Dialog */}
      <DialogRoot open={!!deleteTarget} onOpenChange={d => { if (!d.open) setDeleteTarget(null); }}>
        <DialogBackdrop />
        <DialogContent maxW={{ base: '95vw', md: '420px' }} mx="auto">
          <DialogHeader><Text fontWeight={700} color="red.600">Delete Product</Text><DialogCloseTrigger /></DialogHeader>
          <DialogBody>
            <Text fontSize="sm" color="gray.700">
              Are you sure you want to delete <Text as="span" fontWeight={700}>{deleteTarget?.name}</Text>? This cannot be undone.
            </Text>
          </DialogBody>
          <DialogFooter gap={3}>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button colorPalette="red" onClick={handleDelete} loading={deleting}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      {/* Bulk Import Dialog */}
      <DialogRoot open={importOpen} onOpenChange={d => setImportOpen(d.open)} size="xl">
        <DialogBackdrop />
        <DialogContent maxW={{ base: '95vw', md: '680px' }} mx="auto">
          <DialogHeader><Text fontWeight={700}>Bulk Import Products</Text><DialogCloseTrigger /></DialogHeader>
          <DialogBody>
            <VStack gap={5} align="stretch">
              <Box bg="blue.50" rounded="lg" p={4}>
                <Text fontSize="sm" fontWeight={600} color="blue.800" mb={2}>Required Excel columns:</Text>
                <Text fontSize="xs" fontFamily="mono" color="blue.700" lineHeight={1.8}>
                  name · sku · brandName · categoryName · shortDescription · description · imageUrl · basePrice · status · specKeys · specValues
                </Text>
                <Text fontSize="xs" color="blue.600" mt={2}>
                  specKeys and specValues are pipe-separated — e.g. <Text as="span" fontFamily="mono">Wattage|Color Temp</Text> and <Text as="span" fontFamily="mono">36W|4000K</Text>
                </Text>
                <Button size="xs" colorPalette="blue" variant="outline" mt={3} onClick={downloadTemplate}>
                  ↓ Download Template
                </Button>
              </Box>

              <Box
                border="2px dashed" borderColor="gray.200" rounded="xl" p={8}
                textAlign="center" cursor="pointer" _hover={{ borderColor: 'blue.300', bg: 'blue.50' }}
                onClick={() => fileRef.current?.click()}
              >
                <Text fontSize="2xl" mb={2}>📂</Text>
                <Text fontSize="sm" fontWeight={600} color="gray.700">Click to select Excel file (.xlsx / .xls)</Text>
                {importFilename && (
                  <Text fontSize="xs" color="blue.600" mt={1}>{importFilename} — {importRows.length} rows detected</Text>
                )}
                <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} style={{ display: 'none' }} />
              </Box>

              {importRows.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight={600} color="gray.700" mb={2}>Preview (first 3 rows):</Text>
                  <Box overflowX="auto" bg="gray.50" rounded="lg" p={3} fontSize="xs" fontFamily="mono" color="gray.700">
                    {importRows.slice(0, 3).map((row, i) => (
                      <Box key={i} mb={1}>{JSON.stringify(row)}</Box>
                    ))}
                    {importRows.length > 3 && <Text color="gray.400">…and {importRows.length - 3} more rows</Text>}
                  </Box>
                </Box>
              )}

              {importResult && (
                <Box>
                  <Separator mb={3} />
                  <HStack gap={4} mb={2}>
                    <Badge colorPalette="green" size="lg">✓ {importResult.created} created</Badge>
                    {importResult.skipped > 0 && <Badge colorPalette="orange" size="lg">⚠ {importResult.skipped} skipped</Badge>}
                  </HStack>
                  {importResult.errors.length > 0 && (
                    <Box bg="red.50" rounded="lg" p={3} maxH="120px" overflowY="auto">
                      {importResult.errors.map((e, i) => <Text key={i} fontSize="xs" color="red.700">{e}</Text>)}
                    </Box>
                  )}
                </Box>
              )}
            </VStack>
          </DialogBody>
          <DialogFooter gap={3}>
            <Button variant="ghost" onClick={() => setImportOpen(false)}>Close</Button>
            <Button colorPalette="green" onClick={handleImport} loading={importing} disabled={importRows.length === 0}>
              Import {importRows.length > 0 ? `${importRows.length} Products` : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
}
