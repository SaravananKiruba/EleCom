'use client';

import { Box, SimpleGrid, Text, HStack, VStack, Flex, Separator, Link as ChakraLink } from '@chakra-ui/react';
import Link from 'next/link';

export function PublicFooter() {
  return (
    <Box as="footer" bg="gray.900" color="gray.300" mt="auto">
      <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 10, md: 16 }}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={8}>
          <Box>
            <HStack gap={2} mb={4}>
              <Box bg="blue.500" color="white" rounded="lg" w={8} h={8} display="flex" alignItems="center" justifyContent="center" fontSize="sm" fontWeight={700}>⚡</Box>
              <Text fontWeight={800} fontSize="lg" color="white">EleCom</Text>
            </HStack>
            <Text fontSize="sm" color="gray.400" lineHeight="tall">
              Your trusted partner for professional electrical products procurement. Serving contractors, builders, and architects across India.
            </Text>
          </Box>

          <Box>
            <Text fontWeight={700} color="white" mb={4} fontSize="sm" textTransform="uppercase" letterSpacing="wide">Products</Text>
            <VStack align="start" gap={2}>
              {['Electrical & Lighting', 'Switchgear', 'Cables & Wires', 'Fans', 'Industrial'].map(c => (
                <Link key={c} href="/catalogue" style={{ textDecoration: 'none' }}>
                  <Text fontSize="sm" color="gray.400" _hover={{ color: 'white' }}>{c}</Text>
                </Link>
              ))}
            </VStack>
          </Box>

          <Box>
            <Text fontWeight={700} color="white" mb={4} fontSize="sm" textTransform="uppercase" letterSpacing="wide">Company</Text>
            <VStack align="start" gap={2}>
              {['About Us', 'Contact', 'Careers', 'Blog'].map(c => (
                <Text key={c} fontSize="sm" color="gray.400" cursor="pointer" _hover={{ color: 'white' }}>{c}</Text>
              ))}
            </VStack>
          </Box>

          <Box>
            <Text fontWeight={700} color="white" mb={4} fontSize="sm" textTransform="uppercase" letterSpacing="wide">Contact</Text>
            <VStack align="start" gap={2}>
              <Text fontSize="sm" color="gray.400">📍 Mumbai, India</Text>
              <Text fontSize="sm" color="gray.400">📞 +91 98765 43210</Text>
              <Text fontSize="sm" color="gray.400">✉️ sales@elecom.in</Text>
              <Text fontSize="sm" color="gray.400">🕐 Mon–Sat 9am–6pm</Text>
            </VStack>
          </Box>
        </SimpleGrid>

        <Separator my={8} borderColor="gray.700" />
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Text fontSize="xs" color="gray.500">© 2026 EleCom. All rights reserved.</Text>
          <HStack gap={4}>
            <Text fontSize="xs" color="gray.500" cursor="pointer" _hover={{ color: 'white' }}>Privacy Policy</Text>
            <Text fontSize="xs" color="gray.500" cursor="pointer" _hover={{ color: 'white' }}>Terms of Service</Text>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
}
