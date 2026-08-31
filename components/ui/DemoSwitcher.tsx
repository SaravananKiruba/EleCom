'use client';

/**
 * DemoSwitcher — development/demo only.
 * Exposes quick login as preset users to demonstrate multi-tenant architecture.
 * This component must NEVER be shipped to production as a role-switching mechanism.
 */

import { Box, Text, Button, VStack, HStack, Flex } from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, AuthUser } from '@/context/AuthContext';

const DEMO_USERS: { label: string; description: string; user: AuthUser; redirect: string }[] = [
  {
    label: 'SaaS Admin',
    description: 'Platform-wide visibility',
    redirect: '/saas-admin',
    user: { role: 'saasadmin', name: 'Platform Admin', email: 'saasadmin@crmboo.com' },
  },
  {
    label: 'Admin — CVS Lighting',
    description: 'Tenant 1 sales/admin',
    redirect: '/admin',
    user: { role: 'admin', name: 'Arjun Mehta', email: 'arjun@cvslighting.com', tenantId: 'tenant-1', tenantName: 'CVS Lighting' },
  },
  {
    label: 'Admin — Demo Lighting',
    description: 'Tenant 2 sales/admin',
    redirect: '/admin',
    user: { role: 'admin', name: 'Preethi Rajan', email: 'preethi@demolighting.com', tenantId: 'tenant-2', tenantName: 'Demo Lighting Co.' },
  },
  {
    label: 'Customer',
    description: 'Kumar Constructions (Tenant 1)',
    redirect: '/dashboard',
    user: { role: 'customer', name: 'Rajesh Kumar', email: 'rajesh@kumarconstructions.com', tenantId: 'tenant-1', customerId: 'cust-1' },
  },
  {
    label: 'Architect',
    description: 'Desai Architecture Studio',
    redirect: '/catalogue',
    user: { role: 'architect', name: 'Amit Desai', email: 'amit@desaistudio.com', tenantId: 'tenant-1', architectId: 'arch-1', discount: 10 },
  },
];

export function DemoSwitcher() {
  const { login } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (process.env.NODE_ENV === 'production') return null;

  const handleSelect = (item: typeof DEMO_USERS[0]) => {
    login(item.user);
    setOpen(false);
    router.push(item.redirect);
  };

  return (
    <Box position="fixed" bottom={4} right={4} zIndex={9999}>
      {open && (
        <Box
          bg="white" rounded="xl" border="1px solid" borderColor="gray.200"
          shadow="lg" p={4} mb={3} w="260px"
        >
          <Text fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={3}>
            Demo — Switch Role
          </Text>
          <VStack align="stretch" gap={2}>
            {DEMO_USERS.map(u => (
              <Box
                key={u.label}
                px={3} py={2} rounded="lg" cursor="pointer" border="1px solid"
                borderColor="gray.100" _hover={{ bg: 'gray.50', borderColor: 'green.200' }}
                onClick={() => handleSelect(u)}
              >
                <Text fontSize="sm" fontWeight={600} color="gray.800">{u.label}</Text>
                <Text fontSize="xs" color="gray.400">{u.description}</Text>
              </Box>
            ))}
          </VStack>
        </Box>
      )}
      <Flex justify="flex-end">
        <Button
          size="sm" colorPalette="green" rounded="full" shadow="md"
          onClick={() => setOpen(o => !o)}
        >
          {open ? '✕ Close' : '⚡ Demo'}
        </Button>
      </Flex>
    </Box>
  );
}
