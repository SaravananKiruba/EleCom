'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Box, SimpleGrid, Text, Button, HStack, VStack, Flex, Badge, Input } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/ui/EmptyState';

interface Brand { id: string; name: string; }
interface Category { id: string; name: string; }
interface Product {
  id: string; name: string; slug: string; sku: string;
  shortDescription?: string | null; imageUrl?: string | null;
  brand?: Brand | null;
}
interface Store { id: string; name: string; tagline: string; }

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [store, setStore] = useState<Store | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const s = await fetch('/api/store/current').then(r => r.ok ? r.json() : null);
      if (!s) { setNotFound(true); return; }
      setStore(s);
      const [tax, prods] = await Promise.all([
        fetch('/api/store/current/taxonomy').then(r => r.json()),
        fetch('/api/store/current/products?take=8').then(r => r.json()),
      ]);
      setBrands(tax.brands ?? []);
      setCategories(tax.categories ?? []);
      setFeatured(prods.products ?? []);
    })();
  }, []);

  if (notFound) {
    return (
      <Box maxW="720px" mx="auto" py={20} px={6}>
        <EmptyState
          icon="🏬"
          title="No storefront configured for this domain"
          description="Add a custom domain from the SaaS admin panel or use a subdomain."
        />
      </Box>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/catalogue?q=${encodeURIComponent(search)}`);
  };

  return (
    <Box>
      <Box bg="linear-gradient(135deg, #37463e 0%, #5a6e63 55%, #6b8375 100%)" color="white" py={{ base: 14, md: 24 }} px={{ base: 4, md: 6 }}>
        <Box maxW="1400px" mx="auto">
          <Flex align="center" justify="space-between" gap={10} flexWrap="wrap">
            <Box maxW="600px">
              <Badge bg="rgba(255,255,255,0.15)" color="white" mb={4} px={3} py={1} rounded="full" fontSize="xs" fontWeight={600}>
                B2B Sales Platform
              </Badge>
              <Text fontSize={{ base: '3xl', md: '5xl' }} fontWeight={800} lineHeight="1.1" mb={4}>
                {store?.name ?? 'CRMBoo'}
              </Text>
              <Text fontSize={{ base: 'md', md: 'lg' }} color="blue.100" mb={8} lineHeight="relaxed">
                {store?.tagline ?? 'Fast quotes. Real prices. Delivered.'}
              </Text>
              <Box as="form" onSubmit={handleSearch}>
                <Flex gap={2} maxW="520px" bg="white" rounded="xl" p={1.5} shadow="xl">
                  <Input flex={1} border="none" placeholder="Search products, brands, categories..." value={search} onChange={e => setSearch(e.target.value)} color="gray.800" bg="transparent" size="md" />
                  <Button type="submit" colorPalette="blue" size="md" rounded="lg" px={5}>Search</Button>
                </Flex>
              </Box>
            </Box>
          </Flex>
        </Box>
      </Box>

      {categories.length > 0 && (
        <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 10, md: 16 }}>
          <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
            <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} color="gray.900">Browse by Category</Text>
            <Link href="/catalogue"><Button variant="outline" colorPalette="blue" size="sm">View All →</Button></Link>
          </Flex>
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} gap={4}>
            {categories.slice(0, 12).map(cat => (
              <Link key={cat.id} href={`/catalogue?category=${cat.id}`} style={{ textDecoration: 'none' }}>
                <Box bg="white" rounded="xl" p={4} textAlign="center" border="1px solid" borderColor="gray.100" shadow="sm" _hover={{ shadow: 'md', borderColor: 'blue.200', transform: 'translateY(-2px)' }} transition="all 0.2s" cursor="pointer">
                  <Text fontSize="xs" fontWeight={600} color="gray.700">{cat.name}</Text>
                </Box>
              </Link>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {featured.length > 0 && (
        <Box bg="white" py={{ base: 10, md: 16 }}>
          <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }}>
            <Flex justify="space-between" align="center" mb={8} flexWrap="wrap" gap={4}>
              <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} color="gray.900">Featured Products</Text>
              <Link href="/catalogue"><Button variant="outline" colorPalette="blue" size="sm">View All Products →</Button></Link>
            </Flex>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 4 }} gap={5}>
              {featured.map(product => (
                <Link key={product.id} href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                  <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden" _hover={{ shadow: 'lg', borderColor: 'blue.100' }} transition="all 0.2s" h="full" display="flex" flexDirection="column">
                    <Box bg="gray.50" h="180px" display="flex" alignItems="center" justifyContent="center" overflow="hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain' }} />
                      ) : (
                        <Text fontSize="xs" color="gray.400">No image</Text>
                      )}
                    </Box>
                    <Box p={4} flex={1} display="flex" flexDirection="column">
                      {product.brand && <Text fontSize="xs" color="blue.600" fontWeight={600} mb={1}>{product.brand.name}</Text>}
                      <Text fontSize="sm" fontWeight={600} color="gray.800" mb={2} flex={1}>{product.name}</Text>
                      {product.shortDescription && <Text fontSize="xs" color="gray.500" mb={3}>{product.shortDescription}</Text>}
                      <Text fontSize="xs" color="gray.400" mb={3} fontFamily="mono">SKU: {product.sku}</Text>
                      <Button colorPalette="blue" size="sm" variant="outline" w="full" rounded="lg">Get Best Price</Button>
                    </Box>
                  </Box>
                </Link>
              ))}
            </SimpleGrid>
          </Box>
        </Box>
      )}

      {brands.length > 0 && (
        <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 10, md: 16 }}>
          <Text textAlign="center" fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} color="gray.900" mb={8}>Brands</Text>
          <SimpleGrid columns={{ base: 3, sm: 4, md: 6 }} gap={4}>
            {brands.slice(0, 12).map(brand => (
              <Link key={brand.id} href={`/catalogue?brand=${brand.id}`} style={{ textDecoration: 'none' }}>
                <Flex bg="white" rounded="xl" p={4} align="center" justify="center" border="1px solid" borderColor="gray.100" shadow="sm" _hover={{ shadow: 'md', borderColor: 'blue.200' }} transition="all 0.2s" h="72px" cursor="pointer">
                  <Text fontWeight={700} fontSize="sm" color="gray.600">{brand.name}</Text>
                </Flex>
              </Link>
            ))}
          </SimpleGrid>
        </Box>
      )}

      <Box bg="blue.600" py={{ base: 10, md: 14 }} px={{ base: 4, md: 6 }}>
        <Box maxW="900px" mx="auto" textAlign="center">
          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight={800} color="white" mb={3}>Ready to request a quote?</Text>
          <Text color="blue.100" fontSize="md" mb={8}>Add products to your quote cart and submit a single RFQ.</Text>
          <HStack gap={4} justify="center" flexWrap="wrap">
            <Link href="/catalogue"><Button size="lg" bg="white" color="blue.700" fontWeight={700} rounded="xl" px={8}>Browse Products</Button></Link>
            <Link href="/architect-partner"><Button size="lg" variant="outline" color="white" borderColor="white" fontWeight={600} rounded="xl" px={8}>Architect Partner</Button></Link>
          </HStack>
        </Box>
      </Box>
    </Box>
  );
}
