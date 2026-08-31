'use client';

import { Box, Flex, Text, VStack, HStack, IconButton, Badge } from '@chakra-ui/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊', exact: true },
  { href: '/admin/rfqs', label: 'RFQs', icon: '📋' },
  { href: '/admin/quotations', label: 'Quotations', icon: '💬' },
  { href: '/admin/follow-ups', label: 'Follow-ups', icon: '📅' },
  { href: '/admin/customers', label: 'Customers', icon: '👥' },
  { href: '/admin/architects', label: 'Architects', icon: '🏛️' },
  { href: '/admin/products', label: 'Products', icon: '📦' },
  { href: '/admin/sales-orders', label: 'Sales Orders', icon: '🛒' },
  { href: '/admin/reports', label: 'Reports', icon: '📈' },
  { href: '/admin/team', label: 'Team', icon: '👤' },
  { href: '/admin/audit', label: 'Audit Log', icon: '🔍' },
  { href: '/admin/settings', label: 'Store Settings', icon: '⚙️' },
];

function SidebarContent({ pathname, badges, onClose, onLogout }: {
  pathname: string;
  badges: Record<string, number>;
  onClose?: () => void;
  onLogout?: () => void;
}) {
  return (
    <Box h="full" display="flex" flexDirection="column">
      <Box p={5} borderBottom="1px solid" borderColor="gray.100">
        <Link href="/admin" style={{ textDecoration: 'none' }} onClick={onClose}>
          <HStack gap={2}>
            <Box bg="blue.600" color="white" rounded="lg" w={8} h={8} display="flex" alignItems="center" justifyContent="center" fontSize="sm" fontWeight={700}>⚡</Box>
            <Box>
              <Text fontWeight={800} fontSize="sm" color="gray.900">CRMBoo Admin</Text>
              <Text fontSize="10px" color="gray.400">CRM Platform</Text>
            </Box>
          </HStack>
        </Link>
      </Box>

      <VStack align="stretch" gap={0.5} p={3} flex={1} overflowY="auto">
        {NAV_ITEMS.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const badge = badges[item.href] ?? 0;
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} onClick={onClose}>
              <Flex align="center" gap={3} px={3} py={2.5} rounded="lg"
                bg={active ? 'blue.50' : 'transparent'} color={active ? 'blue.700' : 'gray.600'}
                _hover={{ bg: active ? 'blue.50' : 'gray.50', color: active ? 'blue.700' : 'gray.800' }} cursor="pointer">
                <Text fontSize="md">{item.icon}</Text>
                <Text flex={1} fontSize="sm" fontWeight={active ? 700 : 500}>{item.label}</Text>
                {badge > 0 && (
                  <Badge colorPalette="red" borderRadius="full" size="sm" minW="18px" h="18px" display="flex" alignItems="center" justifyContent="center" fontSize="10px">{badge}</Badge>
                )}
              </Flex>
            </Link>
          );
        })}
      </VStack>

      <Box p={3} borderTop="1px solid" borderColor="gray.100">
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Flex align="center" gap={3} px={3} py={2.5} rounded="lg" _hover={{ bg: 'gray.50' }} cursor="pointer">
            <Text fontSize="md">🌐</Text>
            <Text fontSize="sm" fontWeight={500} color="gray.600">Public Portal</Text>
          </Flex>
        </Link>
        <Flex align="center" gap={3} px={3} py={2.5} rounded="lg" _hover={{ bg: 'red.50' }} cursor="pointer" onClick={onLogout}>
          <Text fontSize="md">↩</Text>
          <Text fontSize="sm" fontWeight={500} color="red.500">Logout</Text>
        </Flex>
      </Box>
    </Box>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [badges, setBadges] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!loading && user.role !== 'TENANT_ADMIN' && user.role !== 'SALES' && user.role !== 'SAAS_ADMIN') {
      router.replace('/login');
    }
  }, [user.role, loading, router]);

  useEffect(() => {
    if (loading || !user.tenantId) return;
    Promise.all([
      fetch('/api/rfqs?status=NEW&take=1').then(r => r.ok ? r.json() : { total: 0 }).catch(() => ({ total: 0 })),
      fetch('/api/follow-ups?status=OPEN&take=1').then(r => r.ok ? r.json() : { total: 0 }).catch(() => ({ total: 0 })),
    ]).then(([rfqs, fu]) => setBadges({
      '/admin/rfqs': rfqs.total ?? 0,
      '/admin/follow-ups': fu.total ?? 0,
    }));
  }, [loading, user.tenantId, pathname]);

  if (loading) return <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50"><Text color="gray.400" fontSize="sm">Loading…</Text></Box>;
  if (user.role !== 'TENANT_ADMIN' && user.role !== 'SALES' && user.role !== 'SAAS_ADMIN') return null;

  const handleLogout = () => logout().then(() => router.replace('/login'));

  return (
    <Box minH="100vh" bg="gray.50">
      <Box display={{ base: 'none', lg: 'block' }} w="220px" position="fixed" top={0} left={0} h="100vh" bg="white" borderRight="1px solid" borderColor="gray.100" shadow="sm" zIndex={50}>
        <SidebarContent pathname={pathname} badges={badges} onLogout={handleLogout} />
      </Box>

      <Box display={{ base: 'flex', lg: 'none' }} position="fixed" top={0} left={0} right={0} h="56px" bg="white" borderBottom="1px solid" borderColor="gray.100" zIndex={100} px={4} alignItems="center" justifyContent="space-between">
        <HStack gap={2}>
          <Box bg="blue.600" color="white" rounded="lg" w={7} h={7} display="flex" alignItems="center" justifyContent="center" fontSize="xs" fontWeight={700}>⚡</Box>
          <Text fontWeight={800} fontSize="sm">CRMBoo Admin</Text>
        </HStack>
        <IconButton aria-label="Menu" variant="ghost" size="sm" onClick={() => setDrawerOpen(true)}>☰</IconButton>
      </Box>

      <Box ml={{ base: 0, lg: '220px' }} pt={{ base: '56px', lg: 0 }} minH="100vh">
        <Box maxW="1400px" mx="auto">{children}</Box>
      </Box>

      <div onClick={() => setDrawerOpen(false)}
        style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,20,30,0.45)', backdropFilter: 'blur(3px)', opacity: drawerOpen ? 1 : 0, pointerEvents: drawerOpen ? 'auto' : 'none', transition: 'opacity 0.22s ease' }} />
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 201, width: 240, height: '100dvh', background: '#fff', boxShadow: '4px 0 32px rgba(0,0,0,0.12)', transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.26s cubic-bezier(0.4,0,0.2,1)' }}>
        <SidebarContent pathname={pathname} badges={badges} onClose={() => setDrawerOpen(false)} onLogout={handleLogout} />
      </div>

      <Toaster />
    </Box>
  );
}
