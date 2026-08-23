'use client';

import {
  Box, Flex, HStack, Text, Button, IconButton, Badge,
  DrawerRoot, DrawerBackdrop, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseTrigger,
  VStack, Separator,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

const NAV_LINKS = [
  { href: '/catalogue', label: 'Products' },
  { href: '/catalogue', label: 'Categories' },
  { href: '/rfq', label: 'Request Quote' },
  { href: '/architect-partner', label: 'Architect Partner' },
];

const ROLE_COLORS: Record<string, string> = {
  customer: 'blue',
  architect: 'green',
  admin: 'purple',
  guest: 'gray',
};

export function PublicHeader() {
  const { state } = useAppState();
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();
  const cartCount = state.cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <Box as="header" bg="white" borderBottom="1px solid" borderColor="gray.100" position="sticky" top={0} zIndex={100} shadow="sm">
      <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }}>
        <Flex h="64px" align="center" justify="space-between">
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <HStack gap={2}>
              <Box bg="blue.600" color="white" rounded="lg" w={8} h={8} display="flex" alignItems="center" justifyContent="center" fontSize="sm" fontWeight={700}>
                💡
              </Box>
              <Text fontWeight={800} fontSize="lg" color="gray.900" letterSpacing="-0.5px">
                EleCom <Text as="span" color="blue.600">Lighting</Text>
              </Text>
            </HStack>
          </Link>

          {/* Desktop nav */}
          <HStack gap={6} display={{ base: 'none', lg: 'flex' }}>
            {NAV_LINKS.map(l => (
              <Link key={l.label} href={l.href} style={{ textDecoration: 'none' }}>
                <Text fontSize="sm" fontWeight={500} color="gray.600" _hover={{ color: 'blue.600' }}>
                  {l.label}
                </Text>
              </Link>
            ))}
          </HStack>

          {/* Right actions */}
          <HStack gap={2}>
            {/* Quote cart */}
            {user.role !== 'admin' && (
              <Box position="relative">
                <Link href="/quote-cart" style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" size="sm" rounded="full" px={3}>
                    <Text mr={1}>🛒</Text>
                    <Text fontSize="sm" display={{ base: 'none', md: 'block' }}>Quote Cart</Text>
                    {cartCount > 0 && (
                      <Badge
                        position="absolute"
                        top="-1"
                        right="-1"
                        colorPalette="blue"
                        borderRadius="full"
                        size="sm"
                        minW={5}
                        h={5}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="10px"
                      >
                        {cartCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </Box>
            )}

            {/* Role indicator + auth actions */}
            {user.role === 'guest' ? (
              <>
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <Button variant="outline" size="sm" colorPalette="blue" display={{ base: 'none', md: 'flex' }}>
                    Sign In
                  </Button>
                </Link>
                <Link href="/admin" style={{ textDecoration: 'none' }}>
                  <Button size="sm" colorPalette="blue" display={{ base: 'none', md: 'flex' }}>
                    Admin
                  </Button>
                </Link>
              </>
            ) : (
              <HStack gap={2} display={{ base: 'none', md: 'flex' }}>
                <Box bg={`${ROLE_COLORS[user.role]}.50`} border="1px solid" borderColor={`${ROLE_COLORS[user.role]}.200`} rounded="lg" px={3} py={1.5}>
                  <HStack gap={1.5}>
                    <Text fontSize="xs" fontWeight={700} color={`${ROLE_COLORS[user.role]}.700`} textTransform="capitalize">
                      {user.role === 'architect' ? `🏛️ ${user.name}` : user.role === 'admin' ? `⚡ Admin` : `👤 ${user.name}`}
                    </Text>
                    {user.discount && (
                      <Badge colorPalette="green" size="xs" rounded="full">{user.discount}% off</Badge>
                    )}
                  </HStack>
                </Box>
                {isAdmin && (
                  <Link href="/admin" style={{ textDecoration: 'none' }}>
                    <Button size="sm" colorPalette="blue" variant="outline">Dashboard</Button>
                  </Link>
                )}
                {!isAdmin && (
                  <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                    <Button variant="outline" size="sm" colorPalette="blue">My Account</Button>
                  </Link>
                )}
                <Button size="sm" variant="ghost" colorPalette="gray" onClick={handleLogout}>Sign Out</Button>
              </HStack>
            )}

            {/* Hamburger */}
            <IconButton
              aria-label="Open menu"
              variant="ghost"
              size="sm"
              display={{ base: 'flex', lg: 'none' }}
              onClick={() => setMenuOpen(true)}
            >
              ☰
            </IconButton>
          </HStack>
        </Flex>
      </Box>

      {/* Mobile Drawer */}
      <DrawerRoot open={menuOpen} onOpenChange={d => setMenuOpen(d.open)} placement="start">
        <DrawerBackdrop />
        <DrawerContent maxW="280px">
          <DrawerHeader borderBottom="1px solid" borderColor="gray.100">
            <HStack>
              <Box bg="blue.600" color="white" rounded="md" w={7} h={7} display="flex" alignItems="center" justifyContent="center" fontSize="xs">💡</Box>
              <Text fontWeight={700} fontSize="md">EleCom Lighting</Text>
            </HStack>
            <DrawerCloseTrigger />
          </DrawerHeader>
          <DrawerBody py={4}>
            <VStack align="stretch" gap={1}>
              {/* Role info */}
              {user.role !== 'guest' && (
                <Box bg="blue.50" rounded="lg" px={3} py={2.5} mb={2}>
                  <Text fontSize="xs" fontWeight={700} color="blue.700" textTransform="capitalize">
                    Signed in as {user.role}: {user.name}
                  </Text>
                  {user.discount && <Text fontSize="xs" color="green.600" mt={0.5}>{user.discount}% architect discount applied</Text>}
                </Box>
              )}
              {NAV_LINKS.map(l => (
                <Link key={l.label} href={l.href} style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                  <Box py={2} px={3} rounded="lg" _hover={{ bg: 'gray.50' }}>
                    <Text fontWeight={500} color="gray.700">{l.label}</Text>
                  </Box>
                </Link>
              ))}
              <Separator my={2} />
              {user.role === 'guest' ? (
                <>
                  <Link href="/login" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                    <Box py={2} px={3} rounded="lg" bg="blue.50">
                      <Text fontWeight={600} color="blue.700">Sign In</Text>
                    </Box>
                  </Link>
                  <Link href="/admin" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                    <Box py={2} px={3} rounded="lg" _hover={{ bg: 'gray.50' }}>
                      <Text fontWeight={500} color="gray.700">Admin Portal</Text>
                    </Box>
                  </Link>
                </>
              ) : (
                <>
                  {!isAdmin && (
                    <Link href="/dashboard" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                      <Box py={2} px={3} rounded="lg" _hover={{ bg: 'gray.50' }}>
                        <Text fontWeight={500} color="gray.700">My Account</Text>
                      </Box>
                    </Link>
                  )}
                  <Link href="/quote-cart" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                    <Box py={2} px={3} rounded="lg" _hover={{ bg: 'gray.50' }}>
                      <HStack>
                        <Text fontWeight={500} color="gray.700">Quote Cart</Text>
                        {cartCount > 0 && <Badge colorPalette="blue" borderRadius="full" size="sm">{cartCount}</Badge>}
                      </HStack>
                    </Box>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                      <Box py={2} px={3} rounded="lg" bg="blue.50">
                        <Text fontWeight={600} color="blue.700">Admin Dashboard</Text>
                      </Box>
                    </Link>
                  )}
                  <Box py={2} px={3} rounded="lg" cursor="pointer" _hover={{ bg: 'red.50' }} onClick={() => { handleLogout(); setMenuOpen(false); }}>
                    <Text fontWeight={500} color="red.600">Sign Out</Text>
                  </Box>
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </Box>
  );
}
