'use client';

import { Box, Grid, Text, HStack, VStack, Badge, Button, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import { useAppState } from '@/context/AppContext';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PageHeader } from '@/components/ui/PageHeader';

export default function SaasAdminDashboard() {
  const { state } = useAppState();
  const { tenants, customers, rfqs, quotes, purchaseOrders } = state;

  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const pendingTenants = tenants.filter(t => t.status === 'pending_approval').length;

  return (
    <Box>
      <PageHeader title="SaaS Platform Dashboard" subtitle="CRMBoo — Platform-wide overview" />

      <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={4} mb={8}>
        <KPICard label="Total Tenants" value={tenants.length} icon="🏢" colorScheme="blue" />
        <KPICard label="Active Tenants" value={activeTenants} icon="✅" colorScheme="green" />
        <KPICard label="Pending Approval" value={pendingTenants} icon="⏳" colorScheme="orange" />
        <KPICard label="Total Customers" value={customers.length} icon="👥" colorScheme="purple" />
      </Grid>

      <Grid templateColumns={{ base: '1fr 1fr', md: 'repeat(3, 1fr)' }} gap={4} mb={8}>
        <KPICard label="Total RFQs" value={rfqs.length} icon="📋" colorScheme="teal" />
        <KPICard label="Total Quotes" value={quotes.length} icon="📄" colorScheme="blue" />
        <KPICard label="Total Sales Orders" value={purchaseOrders.length} icon="📦" colorScheme="green" />
      </Grid>

      <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" overflow="hidden">
        <Flex px={5} py={4} align="center" justify="space-between" borderBottom="1px solid" borderColor="gray.100">
          <Text fontWeight={700} fontSize="md" color="gray.800">All Tenants</Text>
          <Link href="/saas-admin/tenants">
            <Button size="sm" variant="ghost" colorPalette="blue">View All</Button>
          </Link>
        </Flex>
        <Box overflowX="auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                {['Tenant', 'Admin', 'City', 'Customers', 'RFQs', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tenants.map(tenant => {
                const tenantCustomers = customers.filter(c => c.tenantId === tenant.id).length;
                const tenantRFQs = rfqs.filter(r => r.tenantId === tenant.id).length;
                return (
                  <tr key={tenant.id} style={{ borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <Text fontWeight={600} fontSize="sm" color="gray.800">{tenant.name}</Text>
                      <Text fontSize="xs" color="gray.500">{tenant.companyEmail}</Text>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Text fontSize="sm" color="gray.700">{tenant.adminName}</Text>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Text fontSize="sm" color="gray.600">{tenant.city}</Text>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Text fontSize="sm" color="gray.700">{tenantCustomers}</Text>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Text fontSize="sm" color="gray.700">{tenantRFQs}</Text>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={tenant.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Box>
      </Box>
    </Box>
  );
}
