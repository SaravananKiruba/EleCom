'use client';

import { Box, Flex, HStack, Text, Button, IconButton, VStack, Separator,
  DrawerRoot, DrawerBackdrop, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseTrigger,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Marketing header for the platform root — no customer catalogue links (those live on each tenant portal).
const NAV_LINKS = [
  { href: '/architect-partner', label: 'Architect Partner' },
];

export function PublicHeader() {
  const { user, logout, isAdmin, isArchitect } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => logout().then(() => router.push('/'));

  return (
    <Box as="header" bg="white" borderBottom="1px solid" borderColor="gray.100" position="sticky" top={0} zIndex={100} shadow="sm">
      <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }}>
        <Flex h="64px" align="center" justify="space-between">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <HStack gap={2}>
              <Box bg="green.600" color="white" rounded="lg" w={8} h={8} display="flex" alignItems="center" justifyContent="center" fontSize="sm" fontWeight={700}>C</Box>
              <Text fontWeight={800} fontSize="lg" color="gray.900" letterSpacing="-0.5px">CRMBoo</Text>
            </HStack>
          </Link>

          <HStack gap={6} display={{ base: 'none', lg: 'flex' }}>
            {NAV_LINKS.map(l => (
              <Link key={l.label} href={l.href} style={{ textDecoration: 'none' }}>
                <Text fontSize="sm" fontWeight={500} color="gray.600" _hover={{ color: 'blue.600' }}>{l.label}</Text>
              </Link>
            ))}
          </HStack>

          <HStack gap={2}>
            {user.role === 'guest' ? (
              <HStack gap={2} display={{ base: 'none', md: 'flex' }}>
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/signup" style={{ textDecoration: 'none' }}>
                  <Button colorPalette="green" size="sm">Start Free</Button>
                </Link>
              </HStack>
            ) : (
              <HStack gap={2} display={{ base: 'none', md: 'flex' }}>
                {isAdmin && <Link href="/admin"><Button size="sm" colorPalette="blue" variant="outline">Admin</Button></Link>}
                {isArchitect && <Link href="/architect-portal"><Button size="sm" colorPalette="green" variant="outline">Portal</Button></Link>}
                <Button size="sm" variant="ghost" onClick={handleLogout}>Sign Out</Button>
              </HStack>
            )}

            <IconButton aria-label="Open menu" variant="ghost" size="sm" display={{ base: 'flex', lg: 'none' }} onClick={() => setMenuOpen(true)}>☰</IconButton>
          </HStack>
        </Flex>
      </Box>

      <DrawerRoot open={menuOpen} onOpenChange={d => setMenuOpen(d.open)} placement="start">
        <DrawerBackdrop />
        <DrawerContent maxW="280px">
          <DrawerHeader borderBottom="1px solid" borderColor="gray.100">
            <Text fontWeight={700}>CRMBoo</Text>
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
              {user.role === 'guest' ? (
                <>
                  <Link href="/login" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                    <Box py={2} px={3} rounded="lg" _hover={{ bg: 'gray.50' }}>
                      <Text fontWeight={500} color="gray.700">Sign In</Text>
                    </Box>
                  </Link>
                  <Link href="/signup" style={{ textDecoration: 'none' }} onClick={() => setMenuOpen(false)}>
                    <Box py={2} px={3} rounded="lg" bg="green.50">
                      <Text fontWeight={600} color="green.700">Start Free</Text>
                    </Box>
                  </Link>
                </>
              ) : (
                <>
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
