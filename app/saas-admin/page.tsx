'use client';

import { Box, Grid, Text, Button, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';

interface DbTenant { id: string; name: string; email: string; status: string; createdAt: string; }

export default function SaasAdminDashboard() {
  const [tenants, setTenants] = useState<DbTenant[]>([]);

  useEffect(() => {
    fetch('/api/tenants?take=100').then(r => r.json()).then(d => setTenants(d.tenants ?? []));
  }, []);

  const active = tenants.filter(t => t.status === 'ACTIVE').length;
  const pending = tenants.filter(t => t.status === 'PENDING_APPROVAL').length;

  return (
    <Box>
      <PageHeader title="SaaS Platform Dashboard" subtitle="CRMBoo — Platform-wide overview" />

      <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(3, 1fr)' }} gap={4} mb={8}>
        <KPICard label="Total Tenants" value={tenants.length} icon="T" colorScheme="blue" />
        <KPICard label="Active" value={active} icon="A" colorScheme="green" />
        <KPICard label="Pending Approval" value={pending} icon="P" colorScheme="orange" />
      </Grid>

      <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" overflow="hidden">
        <Flex px={5} py={4} align="center" justify="space-between" borderBottom="1px solid" borderColor="gray.100">
          <Text fontWeight={700} fontSize="md" color="gray.800">Tenants</Text>
          <Link href="/saas-admin/tenants">
            <Button size="sm" variant="ghost" colorPalette="blue">Manage All</Button>
          </Link>
        </Flex>
        <Box overflowX="auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Tenant', 'Email', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.length === 0 && (
                <tr><td colSpan={3} style={{ padding: '32px 16px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>No tenants yet.</td></tr>
              )}
              {tenants.map(tenant => (
                <tr key={tenant.id} style={{ borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <Text fontWeight={600} fontSize="sm" color="gray.800">{tenant.name}</Text>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <Text fontSize="sm" color="gray.600">{tenant.email}</Text>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <StatusBadge status={tenant.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </Box>
    </Box>
  );
}
