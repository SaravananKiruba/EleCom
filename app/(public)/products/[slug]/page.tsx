'use client';

import {
  Box, SimpleGrid, Text, Button, HStack, VStack, Flex, Badge,
  TabsRoot, TabsList, TabsTrigger, TabsContent,
  Separator, NumberInput,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { useState } from 'react';
import { products, brands, categories } from '@/data/mockData';
import { useAppState } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { toaster } from '@/components/ui/toaster';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const product = products.find(p => p.slug === slug);

  const { dispatch } = useAppState();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(product?.variants[0] || '');

  if (!product) return notFound();

  const brand = brands.find(b => b.id === product.brandId);
  const category = categories.find(c => c.id === product.categoryId);
  const subcategory = category?.subcategories.find(s => s.id === product.subcategoryId);
  const relatedProducts = products.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

  const PLACEMENT: Record<string, { rooms: string[]; mount: string; height: string; icon: string }> = {
    'sub-1': { rooms: ['Office', 'Retail', 'Hospital', 'Meeting Room'], mount: 'Recessed ceiling', height: '2.5–4m', icon: '🏢' },
    'sub-2': { rooms: ['Corridor', 'Warehouse', 'Garage', 'Home'], mount: 'Surface ceiling mount', height: '2.5–6m', icon: '🏠' },
    'sub-3': { rooms: ['Boutique Retail', 'Gallery', 'Hotel Lobby', 'Restaurant'], mount: 'Track / adjustable arm', height: '2.5–4m', icon: '🛒' },
    'sub-12': { rooms: ['Warehouse', 'Factory', 'Sports Hall', 'Logistics'], mount: 'Pendant ceiling (chain/rod)', height: '6–14m', icon: '🏗️' },
    'sub-13': { rooms: ['Parking', 'Street', 'Stadium', 'Boundary Wall'], mount: 'Pole / wall bracket', height: '4–10m', icon: '🛣️' },
  };
  const placement = PLACEMENT[product.subcategoryId];

  const addToCart = () => {
    dispatch({ type: 'ADD_TO_CART', payload: { productId: product.id, quantity: qty } });
    toaster.create({ title: 'Added to Quote Cart', description: `${qty} × ${product.name}`, type: 'success', duration: 2500 });
  };

  return (
    <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
      {/* Breadcrumb */}
      <HStack gap={1} mb={5} fontSize="sm" color="gray.500" flexWrap="wrap">
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
        <Text>/</Text>
        <Link href="/catalogue" style={{ textDecoration: 'none', color: 'inherit' }}>Catalogue</Link>
        <Text>/</Text>
        <Link href={`/catalogue?category=${category?.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>{category?.name}</Link>
        <Text>/</Text>
        <Text color="gray.800" fontWeight={500}>{product.name}</Text>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 6, md: 10 }} mb={10}>
        {/* Images */}
        <Box>
          <Box bg="gray.50" rounded="2xl" p={6} mb={3} display="flex" alignItems="center" justifyContent="center" h={{ base: '260px', md: '380px' }} overflow="hidden" border="1px solid" borderColor="gray.100">
            <img src={product.images[selectedImg]} alt={product.name}
              style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.src = `https://placehold.co/400x380/e2e8f0/718096?text=${encodeURIComponent(product.name)}`;
              }}
            />
          </Box>
          {product.images.length > 1 && (
            <HStack gap={2} justify="center">
              {product.images.map((img, i) => (
                <Box
                  key={i}
                  w="64px" h="64px" rounded="lg" overflow="hidden" cursor="pointer"
                  border="2px solid" borderColor={selectedImg === i ? 'blue.400' : 'gray.200'}
                  bg="gray.50" display="flex" alignItems="center" justifyContent="center"
                  onClick={() => setSelectedImg(i)}
                  transition="all 0.2s"
                >
                  <img src={img} alt="" style={{ maxHeight: '56px', maxWidth: '56px', objectFit: 'contain' }} />
                </Box>
              ))}
            </HStack>
          )}
        </Box>

        {/* Info */}
        <Box>
          <HStack gap={2} mb={2} flexWrap="wrap">
            <Badge colorPalette="blue" variant="subtle" size="sm">{brand?.name}</Badge>
            <Badge colorPalette="gray" variant="subtle" size="sm">{category?.name}</Badge>
            {subcategory && <Badge colorPalette="gray" variant="outline" size="sm">{subcategory.name}</Badge>}
          </HStack>
          <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight={800} color="gray.900" lineHeight="short" mb={2}>{product.name}</Text>
          <Text fontSize="sm" fontFamily="mono" color="gray.400" mb={4}>SKU: {product.sku}</Text>
          <Text fontSize="sm" color="gray.600" lineHeight="relaxed" mb={4}>{product.description}</Text>
          
          <Box bg="blue.50" rounded="xl" p={4} mb={5} border="1px solid" borderColor="blue.100">
            {user.role === 'architect' && user.discount ? (
              <>
                <Text fontSize="sm" fontWeight={600} color="blue.700">🏷️ Architect Price (your {user.discount}% discount applied)</Text>
                <Text fontSize="xs" color="blue.600" mt={1}>Exact pricing shared in your quotation. Discount auto-applied on quote.</Text>
              </>
            ) : user.role === 'customer' ? (
              <>
                <Text fontSize="sm" fontWeight={600} color="blue.700">💰 Price available on quote</Text>
                <Text fontSize="xs" color="blue.600" mt={1}>Add to cart and submit an RFQ to receive a competitive quote in 10 minutes.</Text>
              </>
            ) : (
              <>
                <Text fontSize="sm" fontWeight={600} color="blue.700">💰 Price on Request</Text>
                <Text fontSize="xs" color="blue.600" mt={1}><Link href="/login" style={{ color: '#6b8375', fontWeight: 700 }}>Sign in</Link> or add to cart to get a quote in 10 minutes.</Text>
              </>
            )}
          </Box>

          {/* Variants */}
          {product.variants.length > 0 && (
            <Box mb={5}>
              <Text fontSize="sm" fontWeight={600} color="gray.700" mb={2}>Available Variants</Text>
              <HStack gap={2} flexWrap="wrap">
                {product.variants.map(v => (
                  <Button
                    key={v}
                    size="sm"
                    variant={selectedVariant === v ? 'solid' : 'outline'}
                    colorPalette={selectedVariant === v ? 'blue' : 'gray'}
                    onClick={() => setSelectedVariant(v)}
                    rounded="lg"
                  >
                    {v}
                  </Button>
                ))}
              </HStack>
            </Box>
          )}

          {/* Quantity & Add */}
          <VStack align="stretch" gap={3}>
            <HStack gap={3}>
              <Text fontSize="sm" fontWeight={600} color="gray.700">Quantity:</Text>
              <HStack>
                <Button size="sm" variant="outline" onClick={() => setQty(q => Math.max(1, q - 1))}>−</Button>
                <Box w="50px" textAlign="center">
                  <Text fontWeight={600}>{qty}</Text>
                </Box>
                <Button size="sm" variant="outline" onClick={() => setQty(q => q + 1)}>+</Button>
              </HStack>
            </HStack>
            <HStack gap={3}>
              <Button colorPalette="blue" size="lg" flex={1} rounded="xl" fontWeight={700} onClick={addToCart}>
                🛒 Add to Quote Cart
              </Button>
              <Link href="/quote-cart" style={{ textDecoration: 'none' }}>
                <Button variant="outline" colorPalette="blue" size="lg" rounded="xl" fontWeight={600}>
                  Request Quote
                </Button>
              </Link>
            </HStack>
          </VStack>

          {/* Docs */}
          {product.documents.length > 0 && (
            <Box mt={5}>
              <Text fontSize="sm" fontWeight={600} color="gray.700" mb={2}>Documents</Text>
              <HStack gap={2} flexWrap="wrap">
                {product.documents.map(doc => (
                  <Button key={doc.label} size="sm" variant="outline" colorPalette="gray" rounded="lg">
                    📄 {doc.label}
                  </Button>
                ))}
              </HStack>
            </Box>
          )}
        </Box>
      </SimpleGrid>

      {/* Tabs */}
      <Box bg="white" rounded="2xl" p={6} border="1px solid" borderColor="gray.100" shadow="sm" mb={6}>
        <TabsRoot defaultValue="specs">
          <TabsList mb={4} borderBottom="1px solid" borderColor="gray.100">
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>
          <TabsContent value="specs">
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
              {product.specifications.map(spec => (
                <Flex key={spec.label} justify="space-between" bg="gray.50" rounded="lg" px={4} py={3} gap={4}>
                  <Text fontSize="sm" color="gray.500" fontWeight={500}>{spec.label}</Text>
                  <Text fontSize="sm" fontWeight={600} color="gray.800" textAlign="right">{spec.value}</Text>
                </Flex>
              ))}
            </SimpleGrid>
          </TabsContent>
          <TabsContent value="features">
            <VStack align="stretch" gap={2}>
              {product.features.map(f => (
                <HStack key={f} gap={3} bg="gray.50" rounded="lg" px={4} py={3}>
                  <Text color="green.500" fontWeight={700}>✓</Text>
                  <Text fontSize="sm" color="gray.700">{f}</Text>
                </HStack>
              ))}
            </VStack>
          </TabsContent>
        </TabsRoot>
      </Box>

      {/* Placement Guide */}
      {placement && (
        <Box bg="white" rounded="2xl" p={6} border="1px solid" borderColor="gray.100" shadow="sm" mb={6}>
          <Text fontWeight={700} fontSize="lg" color="gray.900" mb={4}>💡 Where to Install This Light</Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            <Box bg="blue.50" rounded="xl" p={5} border="1px solid" borderColor="blue.100">
              <Text fontSize="2xl" mb={2}>{placement.icon}</Text>
              <Text fontWeight={700} fontSize="sm" color="blue.800" mb={2}>Ideal Spaces</Text>
              <VStack align="stretch" gap={1}>
                {placement.rooms.map(r => (
                  <HStack key={r} gap={2}>
                    <Text color="blue.500" fontSize="xs">▸</Text>
                    <Text fontSize="sm" color="blue.700">{r}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
            <Box bg="gray.50" rounded="xl" p={5} border="1px solid" borderColor="gray.100">
              <Text fontSize="2xl" mb={2}>🔧</Text>
              <Text fontWeight={700} fontSize="sm" color="gray.700" mb={2}>Mounting Type</Text>
              <Text fontSize="sm" color="gray.600">{placement.mount}</Text>
            </Box>
            <Box bg="green.50" rounded="xl" p={5} border="1px solid" borderColor="green.100">
              <Text fontSize="2xl" mb={2}>📐</Text>
              <Text fontWeight={700} fontSize="sm" color="green.800" mb={2}>Recommended Height</Text>
              <Text fontSize="sm" color="green.700">{placement.height} above floor</Text>
              <Text fontSize="xs" color="green.600" mt={2}>For optimal illumination and energy efficiency</Text>
            </Box>
          </SimpleGrid>
        </Box>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Box>
          <Text fontSize="xl" fontWeight={700} color="gray.900" mb={5}>Related Products</Text>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={5}>
            {relatedProducts.map(rp => {
              const rpBrand = brands.find(b => b.id === rp.brandId);
              return (
                <Link key={rp.id} href={`/products/${rp.slug}`} style={{ textDecoration: 'none' }}>
                  <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden" _hover={{ shadow: 'md' }} transition="all 0.2s">
                    <Box bg="gray.50" h="140px" display="flex" alignItems="center" justifyContent="center">
                      <img src={rp.imageUrl} alt={rp.name} style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain' }}
                        onError={(e) => { e.currentTarget.src = `https://placehold.co/200x140/e2e8f0/718096?text=${encodeURIComponent(rpBrand?.name || '')}` }}
                      />
                    </Box>
                    <Box p={3}>
                      <Text fontSize="xs" color="blue.600" fontWeight={600}>{rpBrand?.name}</Text>
                      <Text fontSize="sm" fontWeight={600} color="gray.800" lineHeight="short">{rp.name}</Text>
                      <Text fontSize="xs" color="gray.500" mt={1}>{rp.shortSpec}</Text>
                    </Box>
                  </Box>
                </Link>
              );
            })}
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
}
