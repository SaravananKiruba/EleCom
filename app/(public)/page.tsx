'use client';

import Link from 'next/link';
import { Box, Text, Button, HStack, VStack, Flex, SimpleGrid, Badge } from '@chakra-ui/react';

const FEATURES = [
  { icon: '🏬', title: 'Your own storefront', desc: 'Custom domain, branded catalogue, tenant-scoped products — one URL to share with every client.' },
  { icon: '📋', title: 'RFQ → Quote → SO', desc: 'End-to-end pipeline from customer request through shared quote to confirmed sales order.' },
  { icon: '🤝', title: 'Architect programme', desc: 'Invite architects, manage discount tiers, track referral history.' },
  { icon: '📊', title: 'CRM & follow-ups', desc: 'Customer profiles, follow-up scheduler, activity timeline and audit log.' },
  { icon: '👥', title: 'Team roles', desc: 'Tenant admin, sales, customers and architects — each with scoped access.' },
  { icon: '🔒', title: 'Multi-tenant secure', desc: 'Every request scoped by JWT-derived tenantId — no cross-tenant leaks.' },
];

export default function LandingPage() {
  return (
    <Box>
      <Box bg="linear-gradient(135deg, #37463e 0%, #5a6e63 55%, #6b8375 100%)" color="white" py={{ base: 20, md: 32 }} px={{ base: 4, md: 6 }}>
        <Box maxW="1100px" mx="auto" textAlign="center">
          <Badge bg="rgba(255,255,255,0.15)" color="white" mb={5} px={3} py={1} rounded="full" fontSize="xs" fontWeight={600}>
            B2B CRM · SaaS
          </Badge>
          <Text fontSize={{ base: '3xl', md: '5xl' }} fontWeight={900} lineHeight="1.05" mb={4} letterSpacing="-1px">
            One platform for your storefront, quotes &amp; sales orders.
          </Text>
          <Text fontSize={{ base: 'md', md: 'lg' }} color="green.100" mb={9} maxW="720px" mx="auto">
            CRMBoo gives every business a branded quote portal — customers browse your catalogue, add products to their cart, and submit RFQs. You quote, they accept, you ship.
          </Text>
          <HStack gap={3} justify="center" flexWrap="wrap">
            <Link href="/signup"><Button size="lg" bg="white" color="green.800" fontWeight={700} rounded="xl" px={8}>Start Free</Button></Link>
            <Link href="/login"><Button size="lg" variant="outline" color="white" borderColor="white" fontWeight={600} rounded="xl" px={8}>Sign In</Button></Link>
          </HStack>
        </Box>
      </Box>

      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 12, md: 20 }}>
        <Text textAlign="center" fontSize={{ base: '2xl', md: '3xl' }} fontWeight={800} color="gray.900" mb={4}>
          Everything you need to sell to businesses.
        </Text>
        <Text textAlign="center" color="gray.500" mb={12} maxW="620px" mx="auto">
          A branded portal for your customers, a working CRM for your sales team.
        </Text>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
          {FEATURES.map(f => (
            <Box key={f.title} bg="white" border="1px solid" borderColor="gray.100" rounded="2xl" p={6} shadow="sm" _hover={{ shadow: 'md' }} transition="all 0.15s">
              <Text fontSize="3xl" mb={3}>{f.icon}</Text>
              <Text fontWeight={700} color="gray.900" mb={2}>{f.title}</Text>
              <Text fontSize="sm" color="gray.600">{f.desc}</Text>
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      <Box bg="gray.50" py={{ base: 12, md: 20 }} px={{ base: 4, md: 6 }}>
        <Box maxW="1000px" mx="auto">
          <Text textAlign="center" fontSize={{ base: '2xl', md: '3xl' }} fontWeight={800} color="gray.900" mb={12}>How it works</Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
            {[
              { n: 1, t: 'Sign up as a tenant', d: 'Get your slug + storefront in 60 seconds.' },
              { n: 2, t: 'Add your catalogue', d: 'Products, brands, categories, specs and variants.' },
              { n: 3, t: 'Share your URL', d: 'Send yourslug.crmboo.io (or your custom domain) to clients.' },
            ].map(s => (
              <VStack key={s.n} align="stretch" gap={2}>
                <Flex bg="green.100" color="green.800" rounded="full" w={12} h={12} align="center" justify="center" fontWeight={800}>{s.n}</Flex>
                <Text fontWeight={700} color="gray.900" mt={2}>{s.t}</Text>
                <Text fontSize="sm" color="gray.600">{s.d}</Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      <Box bg="green.700" py={{ base: 12, md: 16 }} px={{ base: 4, md: 6 }}>
        <Box maxW="900px" mx="auto" textAlign="center">
          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight={800} color="white" mb={3}>Get your own quote portal today.</Text>
          <Text color="green.100" fontSize="md" mb={8}>Free to start. Add your logo, publish products, and share your storefront URL with clients.</Text>
          <HStack gap={3} justify="center" flexWrap="wrap">
            <Link href="/signup"><Button size="lg" bg="white" color="green.800" fontWeight={700} rounded="xl" px={8}>Create Your Store</Button></Link>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
}
