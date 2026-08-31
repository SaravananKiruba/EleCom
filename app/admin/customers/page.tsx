'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Text, Button, HStack, VStack, Flex, SimpleGrid, Separator, Input, Field } from '@chakra-ui/react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { SidePanel } from '@/components/ui/SidePanel';
import { Customer, CustomerStatus } from '@/types';
import { toaster } from '@/components/ui/toaster';
import { downloadCSV } from '@/utils/csvExport';
import { formatEnum } from '@/utils/format';

const STATUSES: CustomerStatus[] = ['LEAD', 'ACTIVE', 'INACTIVE', 'BLOCKED'];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customerCode: '', companyName: '', contactPerson: '', email: '', phone: '', gstNumber: '', businessType: '',
  });

  const load = () => {
    setLoading(true);
    fetch('/api/customers?take=500').then(r => r.json()).then(d => setCustomers(d.customers ?? [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(c =>
      (c.companyName ?? '').toLowerCase().includes(q) ||
      (c.contactPerson ?? '').toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      (c.phone ?? '').toLowerCase().includes(q),
    );
  }, [customers, search]);

  const setStatus = async (c: Customer, status: CustomerStatus) => {
    const res = await fetch(`/api/customers/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toaster.create({ title: `Customer ${formatEnum(status)}`, type: 'success', duration: 2000 });
      const updated = await res.json();
      setSelected(prev => prev ? { ...prev, ...updated } : prev);
      load();
    }
  };

  const submitCreate = async () => {
    if (!form.customerCode || !form.companyName) {
      toaster.create({ title: 'Code and company name are required', type: 'error', duration: 3000 });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toaster.create({ title: data.error ?? 'Failed', type: 'error', duration: 3000 }); return; }
      toaster.create({ title: 'Customer created', type: 'success', duration: 2000 });
      setCreateOpen(false);
      setForm({ customerCode: '', companyName: '', contactPerson: '', email: '', phone: '', gstNumber: '', businessType: '' });
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader title="Customers" subtitle={`${customers.length} total`}
        actions={
          <HStack gap={2}>
            <Button size="sm" colorPalette="blue" onClick={() => setCreateOpen(true)}>+ Add Customer</Button>
            <Button size="sm" variant="outline" colorPalette="green"
              onClick={() => downloadCSV(filtered.map(c => ({
                Code: c.customerCode, Company: c.companyName, Contact: c.contactPerson ?? '',
                Email: c.email ?? '', Phone: c.phone ?? '', GST: c.gstNumber ?? '', Status: c.status,
              })), 'customers.csv')}>↓ Export CSV</Button>
          </HStack>
        } />

      <Box mb={5} maxW="400px">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, company, email..." />
      </Box>

      {loading ? (
        <Text color="gray.400" fontSize="sm">Loading customers…</Text>
      ) : filtered.length === 0 ? (
        <EmptyState icon="👥" title="No customers" />
      ) : (
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: 700 }}>
              <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Box as="tr">
                  {['Code', 'Company', 'Contact', 'Email', 'Phone', 'Status'].map(h => (
                    <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {filtered.map(c => (
                  <Box as="tr" key={c.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'blue.50', cursor: 'pointer' }} onClick={() => { setSelected(c); setDetailOpen(true); }}>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" fontFamily="mono" color="gray.500">{c.customerCode}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={600}>{c.companyName}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm">{c.contactPerson ?? '—'}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.500">{c.email ?? '—'}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" fontFamily="mono" color="gray.500">{c.phone ?? '—'}</Text></Box>
                    <Box as="td" px={4} py={3}><StatusBadge status={c.status} /></Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <SidePanel open={detailOpen} onClose={() => setDetailOpen(false)}
        title={selected && <Text fontWeight={700} fontSize="sm">{selected.companyName}</Text>}>
        {selected && (
          <VStack gap={5} align="stretch">
            <SimpleGrid columns={2} gap={3}>
              <Box><Text fontSize="10px" color="gray.400">Code</Text><Text fontSize="sm" fontWeight={600} fontFamily="mono">{selected.customerCode}</Text></Box>
              <Box><Text fontSize="10px" color="gray.400">Status</Text><StatusBadge status={selected.status} /></Box>
              <Box><Text fontSize="10px" color="gray.400">Contact</Text><Text fontSize="sm" fontWeight={600}>{selected.contactPerson ?? '—'}</Text></Box>
              <Box><Text fontSize="10px" color="gray.400">Email</Text><Text fontSize="sm" fontWeight={600}>{selected.email ?? '—'}</Text></Box>
              <Box><Text fontSize="10px" color="gray.400">Phone</Text><Text fontSize="sm" fontWeight={600}>{selected.phone ?? '—'}</Text></Box>
              <Box><Text fontSize="10px" color="gray.400">GST</Text><Text fontSize="sm" fontWeight={600}>{selected.gstNumber ?? '—'}</Text></Box>
            </SimpleGrid>
            <Separator />
            <Box>
              <Text fontWeight={700} fontSize="xs" color="gray.400" mb={2} textTransform="uppercase" letterSpacing="widest">Status</Text>
              <HStack gap={2} flexWrap="wrap">
                {STATUSES.map(s => (
                  <Button key={s} size="sm" variant={selected.status === s ? 'solid' : 'outline'} colorPalette={s === 'ACTIVE' ? 'green' : s === 'BLOCKED' ? 'red' : 'gray'} onClick={() => setStatus(selected, s)}>
                    {formatEnum(s)}
                  </Button>
                ))}
              </HStack>
            </Box>
          </VStack>
        )}
      </SidePanel>

      <SidePanel open={createOpen} onClose={() => setCreateOpen(false)} title={<Text fontWeight={700}>Add Customer</Text>}>
        <VStack gap={4} align="stretch">
          <Field.Root><Field.Label>Customer Code *</Field.Label>
            <Input value={form.customerCode} onChange={e => setForm(p => ({ ...p, customerCode: e.target.value }))} placeholder="CUS-000123" />
          </Field.Root>
          <Field.Root><Field.Label>Company Name *</Field.Label>
            <Input value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} />
          </Field.Root>
          <Field.Root><Field.Label>Contact Person</Field.Label>
            <Input value={form.contactPerson} onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))} />
          </Field.Root>
          <Field.Root><Field.Label>Email</Field.Label>
            <Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" />
          </Field.Root>
          <Field.Root><Field.Label>Phone</Field.Label>
            <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
          </Field.Root>
          <Field.Root><Field.Label>GST Number</Field.Label>
            <Input value={form.gstNumber} onChange={e => setForm(p => ({ ...p, gstNumber: e.target.value }))} />
          </Field.Root>
          <Field.Root><Field.Label>Business Type</Field.Label>
            <Input value={form.businessType} onChange={e => setForm(p => ({ ...p, businessType: e.target.value }))} />
          </Field.Root>
          <Button colorPalette="blue" onClick={submitCreate} loading={saving}>Create Customer</Button>
        </VStack>
      </SidePanel>
    </Box>
  );
}
