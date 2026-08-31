'use client';

import { Box, Text, Button, VStack, HStack, Input, Field, Badge, Spinner } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SidePanel } from '@/components/ui/SidePanel';
import { SearchInput } from '@/components/ui/SearchInput';

interface DbTenant {
  id: string; slug: string; name: string; email: string; phone?: string;
  gstNumber?: string; status: string; createdAt: string;
  users?: { id: string; name: string; email: string; role: string }[];
}

interface DomainRecord {
  id: string; domain: string; isPrimary: boolean;
  domainStatus: string; verifiedAt: string | null; createdAt: string;
}

/** Detect whether a domain is a root apex domain or a subdomain */
function domainType(domain: string): 'apex' | 'subdomain' {
  const parts = domain.split('.');
  return parts.length <= 2 ? 'apex' : 'subdomain';
}

interface CreateForm {
  name: string; email: string; phone: string; gstNumber: string; industry: string;
  adminName: string; adminEmail: string; adminPassword: string;
}

const EMPTY_FORM: CreateForm = { name: '', email: '', phone: '', gstNumber: '', industry: '', adminName: '', adminEmail: '', adminPassword: '' };

export default function SaasAdminTenantsPage() {
  const [tenants, setTenants] = useState<DbTenant[]>([]);
  const [selected, setSelected] = useState<DbTenant | null>(null);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>(EMPTY_FORM);
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  // Domain management state
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [domainsLoading, setDomainsLoading] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [domainError, setDomainError] = useState('');
  const [addingDomain, setAddingDomain] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/tenants?take=100');
    const data = await res.json();
    setTenants(data.tenants ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadDomains = useCallback(async (tenantId: string) => {
    setDomainsLoading(true);
    try {
      const res = await fetch(`/api/store/domains?tenantId=${tenantId}`);
      setDomains(await res.json());
    } finally {
      setDomainsLoading(false);
    }
  }, []);

  const openTenant = (tenant: DbTenant) => {
    setSelected(tenant);
    setNewDomain('');
    setDomainError('');
    loadDomains(tenant.id);
  };

  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (tenant: DbTenant, action: 'approve' | 'suspend') => {
    await fetch(`/api/tenants/${tenant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    load();
    setSelected(null);
  };

  const addDomain = async () => {
    if (!selected || !newDomain.trim()) return;
    setDomainError('');
    setAddingDomain(true);
    try {
      const res = await fetch('/api/store/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: selected.id, domain: newDomain.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setDomainError(data.error ?? 'Failed to add domain'); return; }
      setNewDomain('');
      loadDomains(selected.id);
    } finally {
      setAddingDomain(false);
    }
  };

  const verifyDomain = async (domainId: string) => {
    setVerifyingId(domainId);
    try {
      await fetch(`/api/store/domains/${domainId}`, { method: 'PATCH' });
      if (selected) loadDomains(selected.id);
    } finally {
      setVerifyingId(null);
    }
  };

  const removeDomain = async (domainId: string) => {
    await fetch(`/api/store/domains/${domainId}`, { method: 'DELETE' });
    if (selected) loadDomains(selected.id);
  };

  const setF = (k: keyof CreateForm, v: string) => setCreateForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    setCreateError('');
    const { name, email, adminName, adminEmail, adminPassword } = createForm;
    if (!name || !email || !adminName || !adminEmail || !adminPassword) {
      setCreateError('All required fields must be filled.');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) { setCreateError(data.error ?? 'Failed to create tenant'); return; }
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      load();
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Tenant Management" subtitle={`${tenants.length} companies registered`}
        actions={<Button size="sm" colorPalette="blue" onClick={() => setShowCreate(true)}>+ Add Tenant</Button>}
      />

      <Box mb={4}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search tenants..." />
      </Box>

      <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" overflow="hidden">
        <Box overflowX="auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Tenant', 'Contact', 'GST', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '40px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>No tenants yet. Click &quot;+ Add Tenant&quot; to create one.</td></tr>
              )}
              {filtered.map(tenant => (
                <tr
                  key={tenant.id}
                  style={{ borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
                  onClick={() => openTenant(tenant)}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <Text fontWeight={600} fontSize="sm" color="gray.800">{tenant.name}</Text>
                    <Text fontSize="xs" color="gray.400">{tenant.slug}</Text>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Text fontSize="sm">{tenant.email}</Text>
                    {tenant.phone && <Text fontSize="xs" color="gray.400">{tenant.phone}</Text>}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Text fontSize="sm" color="gray.600">{tenant.gstNumber ?? '—'}</Text>
                  </td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={tenant.status} /></td>
                  <td style={{ padding: '12px 16px' }}></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>

      {/* Tenant detail panel */}
      <SidePanel open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''}>
        {selected && (
          <VStack align="stretch" gap={4}>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>Status</Text>
              <StatusBadge status={selected.status} />
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>Email</Text>
              <Text fontSize="sm">{selected.email}</Text>
            </Box>
            {selected.phone && <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>Phone</Text>
              <Text fontSize="sm">{selected.phone}</Text>
            </Box>}
            {selected.gstNumber && <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>GST</Text>
              <Text fontSize="sm">{selected.gstNumber}</Text>
            </Box>}
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>Created</Text>
              <Text fontSize="sm">{new Date(selected.createdAt).toLocaleDateString()}</Text>
            </Box>
            {(selected.users ?? []).length > 0 && (
              <Box>
                <Text fontSize="xs" color="gray.500" mb={2}>Admin Users</Text>
                {(selected.users ?? []).filter(u => u.role === 'TENANT_ADMIN').map(u => (
                  <Box key={u.id} p={2} bg="gray.50" rounded="md" mb={1}>
                    <Text fontSize="sm" fontWeight={600}>{u.name}</Text>
                    <Text fontSize="xs" color="gray.500">{u.email}</Text>
                  </Box>
                ))}
              </Box>
            )}

            {/* ── Custom Domains ── */}
            <Box borderTop="1px solid" borderColor="gray.100" pt={4}>
              <Text fontSize="xs" fontWeight={700} color="gray.600" mb={3} textTransform="uppercase">Custom Domains</Text>

              {domainsLoading ? (
                <Spinner size="sm" />
              ) : (
                <VStack align="stretch" gap={2} mb={3}>
                  {domains.length === 0 && (
                    <Text fontSize="xs" color="gray.400">No custom domains yet.</Text>
                  )}
                  {domains.map(d => {
                    const isApex = domainType(d.domain) === 'apex';
                    return (
                      <Box key={d.id} p={3} bg="gray.50" rounded="md" border="1px solid" borderColor="gray.200">
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="sm" fontWeight={600}>{d.domain}</Text>
                          <Badge
                            size="sm"
                            colorPalette={d.domainStatus === 'verified' ? 'green' : d.domainStatus === 'failed' ? 'red' : 'orange'}
                          >
                            {d.domainStatus === 'verified' ? 'Verified' : d.domainStatus === 'failed' ? 'Failed' : 'Pending DNS'}
                          </Badge>
                        </HStack>

                        {/* DNS instructions — shown while pending */}
                        {d.domainStatus !== 'verified' && (
                          <Box mt={2} p={2} bg="blue.50" rounded="sm" border="1px solid" borderColor="blue.100">
                            <Text fontSize="xs" fontWeight={700} color="blue.700" mb={1}>
                              Add this DNS record at your domain registrar:
                            </Text>
                            {isApex ? (
                              <Box fontFamily="mono" fontSize="xs" color="blue.900">
                                <Text>Type: <b>A</b></Text>
                                <Text>Host: <b>@</b></Text>
                                <Text>Value: <b>76.76.21.21</b></Text>
                              </Box>
                            ) : (
                              <Box fontFamily="mono" fontSize="xs" color="blue.900">
                                <Text>Type: <b>CNAME</b></Text>
                                <Text>Host: <b>{d.domain.split('.')[0]}</b></Text>
                                <Text>Value: <b>cname.vercel-dns.com</b></Text>
                              </Box>
                            )}
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              Works the same on GoDaddy, Namecheap, Cloudflare, etc. — only the UI differs.
                            </Text>
                          </Box>
                        )}

                        <HStack gap={2} mt={2}>
                          {d.domainStatus !== 'verified' && (
                            <Button size="xs" variant="outline" colorPalette="blue"
                              loading={verifyingId === d.id}
                              onClick={() => verifyDomain(d.id)}
                            >
                              Check DNS
                            </Button>
                          )}
                          <Button size="xs" variant="ghost" colorPalette="red" onClick={() => removeDomain(d.id)}>
                            Remove
                          </Button>
                        </HStack>
                      </Box>
                    );
                  })}
                </VStack>
              )}

              {/* Add new domain */}
              {domainError && (
                <Text fontSize="xs" color="red.500" mb={2}>{domainError}</Text>
              )}
              <HStack>
                <Input
                  size="sm"
                  placeholder="shop.theirdomain.com"
                  value={newDomain}
                  onChange={e => setNewDomain(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addDomain()}
                />
                <Button size="sm" colorPalette="blue" loading={addingDomain} onClick={addDomain} flexShrink={0}>
                  Add
                </Button>
              </HStack>
            </Box>

            <Box borderTop="1px solid" borderColor="gray.100" pt={4}>
              <Text fontSize="xs" fontWeight={600} color="gray.600" mb={3}>Actions</Text>
              <VStack align="stretch" gap={2}>
                {selected.status !== 'ACTIVE' && (
                  <Button size="sm" colorPalette="green" onClick={() => updateStatus(selected, 'approve')}>Approve / Activate</Button>
                )}
                {selected.status === 'ACTIVE' && (
                  <Button size="sm" colorPalette="orange" variant="outline" onClick={() => updateStatus(selected, 'suspend')}>Suspend</Button>
                )}
              </VStack>
            </Box>
          </VStack>
        )}
      </SidePanel>

      {/* Create Tenant panel */}
      <SidePanel open={showCreate} onClose={() => { setShowCreate(false); setCreateError(''); setCreateForm(EMPTY_FORM); }} title="Add New Tenant">
        <VStack align="stretch" gap={3}>
          {createError && <Box bg="red.50" rounded="md" p={3} border="1px solid" borderColor="red.200"><Text fontSize="sm" color="red.600">{createError}</Text></Box>}
          <Text fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase">Company</Text>
          {(['name', 'email', 'phone', 'gstNumber', 'industry'] as const).map(k => (
            <Field.Root key={k}>
              <Field.Label fontSize="sm" fontWeight={600} textTransform="capitalize">{k.replace(/([A-Z])/g, ' $1')}</Field.Label>
              <Input size="sm" value={createForm[k]} onChange={e => setF(k, e.target.value)} placeholder={k === 'name' ? 'CVS Lighting' : k === 'email' ? 'info@company.com' : ''} />
            </Field.Root>
          ))}
          <Text fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" mt={2}>Tenant Admin Account</Text>
          {(['adminName', 'adminEmail', 'adminPassword'] as const).map(k => (
            <Field.Root key={k}>
              <Field.Label fontSize="sm" fontWeight={600} textTransform="capitalize">{k.replace('admin', '').replace(/([A-Z])/g, ' $1').trim()}</Field.Label>
              <Input size="sm" type={k === 'adminPassword' ? 'password' : 'text'} value={createForm[k]} onChange={e => setF(k, e.target.value)} />
            </Field.Root>
          ))}
          <Button colorPalette="blue" size="md" onClick={handleCreate} mt={2} loading={creating} loadingText="Creating...">
            Create Tenant
          </Button>
        </VStack>
      </SidePanel>
    </Box>
  );
}
