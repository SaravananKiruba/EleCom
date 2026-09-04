'use client';

import { Box, Flex, HStack, Text, VStack, Badge, IconButton } from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';

const NAV = [
  { href: '/saas-admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/saas-admin/tenants', label: 'Tenants', icon: '🏢' },
  { href: '/saas-admin/subscriptions', label: 'Subscriptions', icon: '💳' },
];

function SidebarContent({ pathname, pendingCount, onClose, onLogout }: {
  pathname: string; pendingCount: number; onClose?: () => void; onLogout: () => void;
}) {
  return (
    <Box h="full" display="flex" flexDirection="column" bg="gray.900">
      <Box px={5} py={5} borderBottom="1px solid" borderColor="gray.700">
        <Link href="/saas-admin" style={{ textDecoration: 'none' }} onClick={onClose}>
          <HStack gap={2} align="center">
            <Image src="/crmboo-logo.png" alt="CRMBoo" width={36} height={36} style={{ borderRadius: 8 }} />
            <Box>
              <Text fontWeight={800} fontSize="sm" color="white">CRMBoo</Text>
              <Text fontSize="10px" color="gray.400">SaaS Platform</Text>
            </Box>
          </HStack>
        </Link>
      </Box>

      <VStack align="stretch" gap={0} flex={1} pt={3} overflowY="auto">
        {NAV.map(n => {
          const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} style={{ textDecoration: 'none' }} onClick={onClose}>
              <Flex
                px={4} py={3} gap={3} cursor="pointer" align="center" justify="space-between"
                bg={active ? 'gray.700' : 'transparent'}
                _hover={{ bg: 'gray.700' }}
                transition="background 0.15s"
              >
                <HStack gap={3}>
                  <Text fontSize="md">{n.icon}</Text>
                  <Text fontSize="sm" fontWeight={active ? 700 : 400} color="gray.100">{n.label}</Text>
                </HStack>
                {n.href === '/saas-admin/tenants' && pendingCount > 0 && (
                  <Badge colorPalette="orange" size="sm" rounded="full">{pendingCount}</Badge>
                )}
              </Flex>
            </Link>
          );
        })}
      </VStack>

      <Box px={4} py={4} borderTop="1px solid" borderColor="gray.700">
        <Flex
          align="center" gap={3} px={3} py={2.5} rounded="lg"
          _hover={{ bg: 'red.900' }} cursor="pointer" onClick={onLogout}
        >
          <Text fontSize="md">↩</Text>
          <Text fontSize="sm" fontWeight={500} color="red.400">Logout</Text>
        </Flex>
      </Box>
    </Box>
  );
}

export default function SaasAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isSaasAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch pending count only when confirmed as SaaS admin
  const [fetched, setFetched] = useState(false);
  if (!loading && isSaasAdmin && !fetched) {
    setFetched(true);
    fetch('/api/tenants?status=PENDING_APPROVAL&take=100')
      .then(r => r.ok ? r.json() : { total: 0 })
      .then(d => setPendingCount(d.total ?? 0));
  }

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.900">
        <Text color="gray.400" fontSize="sm">Loading…</Text>
      </Box>
    );
  }

  if (!isSaasAdmin) {
    if (typeof window !== 'undefined') router.replace('/login');
    return null;
  }

  const handleLogout = () => logout().then(() => router.replace('/login'));

  return (
    <Flex minH="100vh" bg="gray.50">
      {/* Desktop Sidebar */}
      <Box
        w="220px" flexShrink={0}
        display={{ base: 'none', lg: 'flex' }}
        flexDir="column"
        position="fixed" top={0} left={0} h="100vh"
        bg="gray.900" zIndex={50}
      >
        <SidebarContent pathname={pathname} pendingCount={pendingCount} onLogout={handleLogout} />
      </Box>

      {/* Mobile Header */}
      <Box
        display={{ base: 'flex', lg: 'none' }}
        position="fixed" top={0} left={0} right={0} h="56px"
        bg="gray.900" zIndex={100} px={4}
        alignItems="center" justifyContent="space-between"
      >
        <HStack gap={2}>
          <Box bg="orange.500" color="white" rounded="lg" w={7} h={7} display="flex" alignItems="center" justifyContent="center" fontSize="xs" fontWeight={700}>⚡</Box>
          <Text fontWeight={800} fontSize="sm" color="white">CRMBoo SaaS</Text>
        </HStack>
        <IconButton aria-label="Menu" variant="ghost" size="sm" color="white" onClick={() => setDrawerOpen(true)}>☰</IconButton>
      </Box>

      {/* Main */}
      <Box flex={1} ml={{ base: 0, lg: '220px' }} pt={{ base: '56px', lg: 0 }} minH="100vh">
        <Box maxW="1400px" mx="auto" p={{ base: 4, md: 6 }}>
          {children}
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <div
        onClick={() => setDrawerOpen(false)}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.6)',
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? 'auto' : 'none',
          transition: 'opacity 0.22s ease',
        }}
      />
      <div
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 201,
          width: 240, background: '#1a202c',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.26s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <SidebarContent pathname={pathname} pendingCount={pendingCount} onClose={() => setDrawerOpen(false)} onLogout={handleLogout} />
      </div>

      <Toaster />
    </Flex>
  );
}
