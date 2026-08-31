'use client';

import { Box, Flex, HStack, Text, VStack, Separator } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

const NAV = [
  { href: '/saas-admin', label: 'Dashboard', icon: '📊' },
  { href: '/saas-admin/tenants', label: 'Tenants', icon: '🏢' },
];

export default function SaasAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isSaasAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Frontend route guard — real auth must be enforced server-side
    if (user.role !== 'saasadmin') {
      router.replace('/login');
    }
  }, [user.role, router]);

  if (!isSaasAdmin) return null;

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* Sidebar */}
      <Box w="220px" bg="gray.900" color="white" flexShrink={0} display={{ base: 'none', md: 'flex' }} flexDir="column">
        <Box px={5} py={5} borderBottom="1px solid" borderColor="gray.700">
          <Text fontWeight={800} fontSize="lg" color="white">CRMBoo</Text>
          <Text fontSize="xs" color="gray.400" mt={0.5}>SaaS Platform</Text>
        </Box>
        <VStack align="stretch" gap={0} flex={1} pt={3}>
          {NAV.map(n => (
            <Link key={n.href} href={n.href} style={{ textDecoration: 'none' }}>
              <HStack
                px={4} py={3} gap={3} cursor="pointer"
                bg={pathname === n.href ? 'gray.700' : 'transparent'}
                _hover={{ bg: 'gray.700' }}
              >
                <Text fontSize="sm">{n.icon}</Text>
                <Text fontSize="sm" fontWeight={pathname === n.href ? 700 : 400} color="gray.100">{n.label}</Text>
              </HStack>
            </Link>
          ))}
        </VStack>
        <Box px={5} py={4} borderTop="1px solid" borderColor="gray.700">
          <Text fontSize="xs" color="gray.400">Signed in as</Text>
          <Text fontSize="sm" color="gray.200" fontWeight={600}>{user.name}</Text>
        </Box>
      </Box>

      {/* Main */}
      <Box flex={1} overflow="auto">
        <Box maxW="1400px" mx="auto" p={{ base: 4, md: 6 }}>
          {children}
        </Box>
      </Box>
    </Flex>
  );
}
