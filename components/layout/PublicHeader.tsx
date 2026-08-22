'use client';

import {
  Box, Flex, HStack, Text, Button, IconButton, Badge, Link as ChakraLink,
  DrawerRoot, DrawerBackdrop, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseTrigger,
  VStack, Separator,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useState } from 'react';
import { useAppState } from '@/context/AppContext';

const NAV_LINKS = [
  { href: '/catalogue', label: 'Products' },
  { href: '/catalogue', label: 'Categories' },
  { href: '/catalogue?filter=brand', label: 'Brands' },
  { href: '/about', label: 'About' },
  { href: '/architect-partner', label: 'Architect Partner' },
];

export function PublicHeader() {
  const { state } = useAppState();
  const cartCount = state.cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Box as="header" bg="white" borderBottom="1px solid" borderColor="gray.100" position="sticky" top={0} zIndex={100} shadow="sm">
      <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }}>
        <Flex h="64px" align="center" justify="space-between">
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <HStack gap={2}>
              <Box bg="blue.600" color="white" rounded="lg" w={8} h={8} display="flex" alignItems="center" justifyContent="center" fontSize="sm" fontWeight={700}>
                ⚡
              </Box>
              <Text fontWeight={800} fontSize="lg" color="gray.900" letterSpacing="-0.5px">
                Ele<Text as="span" color="blue.600">Com</Text>
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

            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm" colorPalette="blue" display={{ base: 'none', md: 'flex' }}>
                My Account
              </Button>
            </Link>

            <Link href="/admin" style={{ textDecoration: 'none' }}>
              <Button size="sm" colorPalette="blue" display={{ base: 'none', md: 'flex' }}>
                Admin
              </Button>
            </Link>

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
        <DrawerContent>
          <DrawerHeader borderBottom="1px solid" borderColor="gray.100">
            <Text fontWeight={700} fontSize="lg">Menu</Text>
            <DrawerCloseTrigger />
          </DrawerHeader>
          <DrawerBody py={4}>
            <VStack align="stretch" gap={1}>
              {NAV_LINKS.map(l => (
                <Link key={l.label} href={l.href} style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                  <Box py={2} px={3} rounded="lg" _hover={{ bg: 'gray.50' }}>
                    <Text fontWeight={500} color="gray.700">{l.label}</Text>
                  </Box>
                </Link>
              ))}
              <Separator my={2} />
              <Link href="/dashboard" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                <Box py={2} px={3} rounded="lg" _hover={{ bg: 'gray.50' }}>
                  <Text fontWeight={500} color="gray.700">My Account</Text>
                </Box>
              </Link>
              <Link href="/quote-cart" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                <Box py={2} px={3} rounded="lg" _hover={{ bg: 'gray.50' }}>
                  <HStack>
                    <Text fontWeight={500} color="gray.700">Quote Cart</Text>
                    {cartCount > 0 && <Badge colorPalette="blue" borderRadius="full" size="sm">{cartCount}</Badge>}
                  </HStack>
                </Box>
              </Link>
              <Link href="/admin" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                <Box py={2} px={3} rounded="lg" bg="blue.50">
                  <Text fontWeight={600} color="blue.700">Admin Portal</Text>
                </Box>
              </Link>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </Box>
  );
}
