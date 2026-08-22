'use client';

import {
  Box, SimpleGrid, Text, Button, HStack, VStack, Flex, Badge, Input,
  Card, CardBody,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { categories, brands, products } from '@/data/mockData';

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/catalogue?q=${encodeURIComponent(search)}`);
  };

  const featuredProducts = products.slice(0, 6);

  return (
    <Box>
      {/* Hero */}
      <Box
        bg="linear-gradient(135deg, #0f2166 0%, #1a56db 60%, #2d7dd2 100%)"
        color="white"
        py={{ base: 14, md: 24 }}
        px={{ base: 4, md: 6 }}
      >
        <Box maxW="1400px" mx="auto">
          <Flex align="center" justify="space-between" gap={10} flexWrap="wrap">
            <Box maxW="600px">
              <Badge bg="rgba(255,255,255,0.15)" color="white" mb={4} px={3} py={1} rounded="full" fontSize="xs" fontWeight={600}>
                🇮🇳 India&apos;s B2B Electrical Platform
              </Badge>
              <Text fontSize={{ base: '3xl', md: '5xl' }} fontWeight={800} lineHeight="1.1" mb={4}>
                Premium Electrical Products for{' '}
                <Text as="span" color="yellow.300">Professionals</Text>
              </Text>
              <Text fontSize={{ base: 'md', md: 'lg' }} color="blue.100" mb={8} lineHeight="relaxed">
                Discover 1000+ electrical products from top brands. Get competitive quotes, manage projects, and streamline procurement — all in one platform.
              </Text>
              <Box as="form" onSubmit={handleSearch}>
                <Flex gap={2} maxW="520px" bg="white" rounded="xl" p={1.5} shadow="xl">
                  <Input
                    flex={1}
                    border="none"
                    outline="none"
                    placeholder="Search products, brands, categories..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    color="gray.800"
                    _focus={{ boxShadow: 'none' }}
                    bg="transparent"
                    size="md"
                  />
                  <Button type="submit" colorPalette="blue" size="md" rounded="lg" px={5}>
                    Search
                  </Button>
                </Flex>
              </Box>
              <HStack gap={6} mt={6} flexWrap="wrap">
                {['50+ Brands', '1000+ Products', 'Fast Quotes', 'GST Invoice'].map(t => (
                  <HStack key={t} gap={1}>
                    <Text color="green.300" fontSize="sm">✓</Text>
                    <Text fontSize="sm" color="blue.100">{t}</Text>
                  </HStack>
                ))}
              </HStack>
            </Box>
            <Box display={{ base: 'none', xl: 'block' }}>
              <Box bg="rgba(255,255,255,0.1)" rounded="2xl" p={8} backdropFilter="blur(10px)" border="1px solid rgba(255,255,255,0.2)">
                <VStack gap={4} align="stretch" minW="260px">
                  <Text fontWeight={700} fontSize="sm" color="blue.100" textTransform="uppercase" letterSpacing="wide">Quick Request</Text>
                  {['LED Panel Lights', 'MCBs & Switchgear', 'Fans & Fixtures'].map(i => (
                    <Link key={i} href={`/catalogue?q=${encodeURIComponent(i)}`} style={{ textDecoration: 'none' }}>
                      <Flex bg="rgba(255,255,255,0.1)" rounded="lg" px={4} py={3} align="center" justify="space-between" _hover={{ bg: 'rgba(255,255,255,0.2)' }} cursor="pointer">
                        <Text fontSize="sm" fontWeight={500}>{i}</Text>
                        <Text>→</Text>
                      </Flex>
                    </Link>
                  ))}
                  <Link href="/rfq" style={{ textDecoration: 'none' }}>
                    <Button w="full" bg="white" color="blue.700" _hover={{ bg: 'blue.50' }} fontWeight={700} size="md" rounded="lg">
                      Request a Quote
                    </Button>
                  </Link>
                </VStack>
              </Box>
            </Box>
          </Flex>
        </Box>
      </Box>

      {/* Categories */}
      <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 10, md: 16 }}>
        <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
          <Box>
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} color="gray.900">Browse by Category</Text>
            <Text color="gray.500" fontSize="sm" mt={1}>Explore our complete electrical product range</Text>
          </Box>
          <Link href="/catalogue">
            <Button variant="outline" colorPalette="blue" size="sm">View All →</Button>
          </Link>
        </Flex>
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} gap={4}>
          {categories.map(cat => (
            <Link key={cat.id} href={`/catalogue?category=${cat.id}`} style={{ textDecoration: 'none' }}>
              <Box
                bg="white"
                rounded="xl"
                p={4}
                textAlign="center"
                border="1px solid"
                borderColor="gray.100"
                shadow="sm"
                _hover={{ shadow: 'md', borderColor: 'blue.200', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
                cursor="pointer"
                h="full"
              >
                <Text fontSize="2xl" mb={2}>{cat.icon}</Text>
                <Text fontSize="xs" fontWeight={600} color="gray.700" lineHeight="short">{cat.name}</Text>
              </Box>
            </Link>
          ))}
        </SimpleGrid>
      </Box>

      {/* Featured Products */}
      <Box bg="white" py={{ base: 10, md: 16 }}>
        <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }}>
          <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
            <Box>
              <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} color="gray.900">Featured Products</Text>
              <Text color="gray.500" fontSize="sm" mt={1}>Top requested products from our catalogue</Text>
            </Box>
            <Link href="/catalogue">
              <Button variant="outline" colorPalette="blue" size="sm">View All Products →</Button>
            </Link>
          </Flex>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 3, xl: 4 }} gap={5}>
            {featuredProducts.map(product => {
              const brand = brands.find(b => b.id === product.brandId);
              return (
                <Link key={product.id} href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                  <Box
                    bg="white"
                    rounded="xl"
                    border="1px solid"
                    borderColor="gray.100"
                    shadow="sm"
                    overflow="hidden"
                    _hover={{ shadow: 'lg', borderColor: 'blue.100' }}
                    transition="all 0.2s"
                    h="full"
                    display="flex"
                    flexDirection="column"
                  >
                    <Box
                      bg="gray.50"
                      h="180px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      overflow="hidden"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain' }}
                        onError={(e) => {
                          e.currentTarget.src = `https://placehold.co/280x180/e2e8f0/718096?text=${encodeURIComponent(brand?.name || 'Product')}`;
                        }}
                      />
                    </Box>
                    <Box p={4} flex={1} display="flex" flexDirection="column">
                      <Text fontSize="xs" color="blue.600" fontWeight={600} mb={1}>{brand?.name}</Text>
                      <Text fontSize="sm" fontWeight={600} color="gray.800" lineHeight="short" mb={2} flex={1}>{product.name}</Text>
                      <Text fontSize="xs" color="gray.500" mb={3}>{product.shortSpec}</Text>
                      <Text fontSize="xs" color="gray.400" mb={3} fontFamily="mono">SKU: {product.sku}</Text>
                      <Button colorPalette="blue" size="sm" variant="outline" w="full" rounded="lg">
                        Get Best Price
                      </Button>
                    </Box>
                  </Box>
                </Link>
              );
            })}
          </SimpleGrid>
        </Box>
      </Box>

      {/* Brands */}
      <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 10, md: 16 }}>
        <Text textAlign="center" fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} color="gray.900" mb={2}>
          Trusted Brands
        </Text>
        <Text textAlign="center" color="gray.500" fontSize="sm" mb={8}>We partner with world-class electrical manufacturers</Text>
        <SimpleGrid columns={{ base: 3, sm: 4, md: 6 }} gap={4}>
          {brands.map(brand => (
            <Link key={brand.id} href={`/catalogue?brand=${brand.id}`} style={{ textDecoration: 'none' }}>
              <Flex
                bg="white"
                rounded="xl"
                p={4}
                align="center"
                justify="center"
                border="1px solid"
                borderColor="gray.100"
                shadow="sm"
                _hover={{ shadow: 'md', borderColor: 'blue.200' }}
                transition="all 0.2s"
                h="72px"
                cursor="pointer"
              >
                <Text fontWeight={700} fontSize="sm" color="gray.600">{brand.name}</Text>
              </Flex>
            </Link>
          ))}
        </SimpleGrid>
      </Box>

      {/* Why Us */}
      <Box bg="gray.900" color="white" py={{ base: 10, md: 16 }}>
        <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }}>
          <Text textAlign="center" fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} mb={2}>Why Choose EleCom?</Text>
          <Text textAlign="center" color="gray.400" fontSize="sm" mb={10}>Built for electrical contractors, builders, and architects</Text>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={6}>
            {[
              { icon: '⚡', title: 'Genuine Products', desc: 'All products sourced from authorized distributors with manufacturer warranty.' },
              { icon: '💬', title: 'Fast Quotations', desc: 'Receive competitive quotes within 24 hours of your request.' },
              { icon: '🚚', title: 'Pan-India Delivery', desc: 'Reliable delivery to all major cities and project sites across India.' },
              { icon: '🤝', title: 'Architect Benefits', desc: 'Special pricing and project support for registered architect partners.' },
            ].map(f => (
              <Box key={f.title} bg="gray.800" rounded="xl" p={6} border="1px solid" borderColor="gray.700">
                <Text fontSize="2xl" mb={3}>{f.icon}</Text>
                <Text fontWeight={700} mb={2}>{f.title}</Text>
                <Text fontSize="sm" color="gray.400" lineHeight="relaxed">{f.desc}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* CTA Banner */}
      <Box bg="blue.600" py={{ base: 10, md: 14 }} px={{ base: 4, md: 6 }}>
        <Box maxW="900px" mx="auto" textAlign="center">
          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight={800} color="white" mb={3}>
            Ready to request your quote?
          </Text>
          <Text color="blue.100" fontSize="md" mb={8}>
            Add products to your quote cart and submit a single RFQ for your entire project requirement.
          </Text>
          <HStack gap={4} justify="center" flexWrap="wrap">
            <Link href="/catalogue">
              <Button size="lg" bg="white" color="blue.700" _hover={{ bg: 'blue.50' }} fontWeight={700} rounded="xl" px={8}>
                Browse Products
              </Button>
            </Link>
            <Link href="/architect-partner">
              <Button size="lg" variant="outline" colorPalette="white" color="white" borderColor="white" _hover={{ bg: 'whiteAlpha.200' }} fontWeight={600} rounded="xl" px={8}>
                Become an Architect Partner
              </Button>
            </Link>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
}
