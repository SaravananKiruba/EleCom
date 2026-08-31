'use client';

import { Box, Flex, HStack, Text, Button, IconButton, Badge, VStack, Separator } from '@chakra-ui/react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenantCart } from '@/context/AppContext';
import { useTenantStore } from '@/context/TenantStoreContext';
import { useAuth } from '@/context/AuthContext';

interface Props { tenantSlug: string; }

export function StoreHeader({ tenantSlug }: Props) {
  const store = useTenantStore();
  const cart = useTenantCart(tenantSlug);
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const base = `/store/${tenantSlug}`;
  const links = [
    { href: `${base}/catalogue`, label: 'Products' },
    { href: `${base}/rfq`, label: 'Request Quote' },
  ];

  const handleLogout = () => logout().then(() => router.push(`${base}/catalogue`));
  const primary = store?.primaryColor ?? '#6b8375';

  return (
    <Box as="header" bg="white" borderBottom="1px solid" borderColor="gray.100" position="sticky" top={0} zIndex={100} shadow="sm">
      <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }}>
        <Flex h="64px" align="center" justify="space-between">
          <Link href={`${base}/catalogue`} style={{ textDecoration: 'none' }}>
            <HStack gap={2}>
              <Box bg={primary} color="white" rounded="lg" w={8} h={8} display="flex" alignItems="center" justifyContent="center" fontSize="sm" fontWeight={700}>
                {(store?.name ?? tenantSlug).charAt(0).toUpperCase()}
              </Box>
              <Text fontWeight={800} fontSize="lg" color="gray.900" letterSpacing="-0.5px">
                {store?.name ?? tenantSlug}
              </Text>
            </HStack>
          </Link>

          <HStack gap={6} display={{ base: 'none', lg: 'flex' }}>
            {links.map(l => (
              <Link key={l.label} href={l.href} style={{ textDecoration: 'none' }}>
                <Text fontSize="sm" fontWeight={500} color="gray.600" _hover={{ color: 'blue.600' }}>{l.label}</Text>
              </Link>
            ))}
          </HStack>

          <HStack gap={2}>
            <Box position="relative">
              <Link href={`${base}/quote-cart`} style={{ textDecoration: 'none' }}>
                <Button variant="ghost" size="sm" rounded="full" px={3}>
                  <Text mr={1}>🛒</Text>
                  <Text fontSize="sm" display={{ base: 'none', md: 'block' }}>Quote Cart</Text>
                  {cart.count > 0 && (
                    <Badge position="absolute" top="-1" right="-1" colorPalette="blue" borderRadius="full" size="sm"
                      minW={5} h={5} display="flex" alignItems="center" justifyContent="center" fontSize="10px">
                      {cart.count}
                    </Badge>
                  )}
                </Button>
              </Link>
            </Box>

            {user.role === 'guest' ? (
              <Link href={`/login?next=${encodeURIComponent(`${base}/catalogue`)}`} style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="sm" colorPalette="blue" display={{ base: 'none', md: 'flex' }}>Sign In</Button>
              </Link>
            ) : (
              <HStack gap={2} display={{ base: 'none', md: 'flex' }}>
                <Link href={`${base}/dashboard`} style={{ textDecoration: 'none' }}>
                  <Button variant="outline" size="sm" colorPalette="blue">My Account</Button>
                </Link>
                <Button size="sm" variant="ghost" colorPalette="gray" onClick={handleLogout}>Sign Out</Button>
              </HStack>
            )}

            <IconButton aria-label="Open menu" variant="ghost" size="sm" display={{ base: 'flex', lg: 'none' }}
              onClick={() => setMenuOpen(true)}>☰</IconButton>
          </HStack>
        </Flex>
      </Box>

      {menuOpen && (
        <Box position="fixed" inset={0} zIndex={200} bg="rgba(0,0,0,0.4)" onClick={() => setMenuOpen(false)}>
          <Box position="absolute" left={0} top={0} bottom={0} w="280px" bg="white" p={5} onClick={e => e.stopPropagation()}>
            <Text fontWeight={700} mb={4}>{store?.name ?? tenantSlug}</Text>
            <VStack align="stretch" gap={1}>
              {links.map(l => (
                <Link key={l.label} href={l.href} style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                  <Box py={2} px={3} rounded="lg" _hover={{ bg: 'gray.50' }}>
                    <Text fontWeight={500} color="gray.700">{l.label}</Text>
                  </Box>
                </Link>
              ))}
              <Separator my={2} />
              {user.role === 'guest' ? (
                <Link href={`/login?next=${encodeURIComponent(`${base}/catalogue`)}`} style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                  <Box py={2} px={3} rounded="lg" bg="blue.50">
                    <Text fontWeight={600} color="blue.700">Sign In</Text>
                  </Box>
                </Link>
              ) : (
                <>
                  <Link href={`${base}/dashboard`} style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                    <Box py={2} px={3} rounded="lg" _hover={{ bg: 'gray.50' }}>
                      <Text fontWeight={500} color="gray.700">My Account</Text>
                    </Box>
                  </Link>
                  <Button size="sm" variant="ghost" colorPalette="red" onClick={() => { setMenuOpen(false); handleLogout(); }}>Sign Out</Button>
                </>
              )}
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  );
}
