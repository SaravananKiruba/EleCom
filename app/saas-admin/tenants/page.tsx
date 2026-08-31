'use client';

import { Box, Text, Flex, Button, VStack, HStack, Badge } from '@chakra-ui/react';
import { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { Tenant } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SidePanel } from '@/components/ui/SidePanel';
import { SearchInput } from '@/components/ui/SearchInput';

export default function SaasAdminTenantsPage() {
  const { state, dispatch } = useAppState();
  const { tenants, customers, rfqs, quotes, purchaseOrders } = state;
  const [selected, setSelected] = useState<Tenant | null>(null);
  const [search, setSearch] = useState('');

  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.city.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = (tenant: Tenant, status: Tenant['status']) => {
    dispatch({ type: 'UPDATE_TENANT', payload: { ...tenant, status } });
    setSelected(s => s?.id === tenant.id ? { ...s, status } : s);
  };

  return (
    <Box>
      <PageHeader title="Tenant Management" subtitle={`${tenants.length} tenants registered`} />

      <Box mb={4}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search tenants..." />
      </Box>

      <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" overflow="hidden">
        <Box overflowX="auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Tenant', 'Admin', 'Location', 'Customers', 'RFQs', 'SOs', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(tenant => {
                const tc = customers.filter(c => c.tenantId === tenant.id).length;
                const tr = rfqs.filter(r => r.tenantId === tenant.id).length;
                const ts = purchaseOrders.filter(p => p.tenantId === tenant.id).length;
                return (
                  <tr
                    key={tenant.id}
                    style={{ borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
                    onClick={() => setSelected(tenant)}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <Text fontWeight={600} fontSize="sm" color="gray.800">{tenant.name}</Text>
                      <Text fontSize="xs" color="gray.400">{tenant.slug}</Text>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Text fontSize="sm">{tenant.adminName}</Text>
                      <Text fontSize="xs" color="gray.400">{tenant.adminEmail}</Text>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Text fontSize="sm">{tenant.city}, {tenant.state}</Text>
                    </td>
                    <td style={{ padding: '12px 16px' }}><Text fontSize="sm">{tc}</Text></td>
                    <td style={{ padding: '12px 16px' }}><Text fontSize="sm">{tr}</Text></td>
                    <td style={{ padding: '12px 16px' }}><Text fontSize="sm">{ts}</Text></td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={tenant.status} /></td>
                    <td style={{ padding: '12px 16px' }}></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      </Box>

      <SidePanel open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''}>
        {selected && (
          <VStack align="stretch" gap={4}>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>Status</Text>
              <StatusBadge status={selected.status} />
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>Company Email</Text>
              <Text fontSize="sm">{selected.companyEmail}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>Admin</Text>
              <Text fontSize="sm" fontWeight={600}>{selected.adminName}</Text>
              <Text fontSize="sm" color="gray.500">{selected.adminEmail}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>Location</Text>
              <Text fontSize="sm">{selected.address}, {selected.city}, {selected.state}, {selected.country}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>GST</Text>
              <Text fontSize="sm">{selected.gst}</Text>
            </Box>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>Created</Text>
              <Text fontSize="sm">{selected.createdAt}</Text>
            </Box>

            <Box borderTop="1px solid" borderColor="gray.100" pt={4}>
              <Text fontSize="xs" fontWeight={600} color="gray.600" mb={3}>Actions</Text>
              <VStack align="stretch" gap={2}>
                {selected.status !== 'active' && (
                  <Button size="sm" colorPalette="green" onClick={() => updateStatus(selected, 'active')}>Activate</Button>
                )}
                {selected.status === 'pending_approval' && (
                  <Button size="sm" colorPalette="red" variant="outline" onClick={() => updateStatus(selected, 'rejected')}>Reject</Button>
                )}
                {selected.status === 'active' && (
                  <Button size="sm" colorPalette="orange" variant="outline" onClick={() => updateStatus(selected, 'suspended')}>Suspend</Button>
                )}
              </VStack>
            </Box>
          </VStack>
        )}
      </SidePanel>
    </Box>
  );
}
