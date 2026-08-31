'use client';

import {
  Box, Text, SimpleGrid, Flex, HStack, Button, VStack,
  TabsRoot, TabsList, TabsTrigger, TabsContent,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { KPICard } from '@/components/ui/KPICard';
import { EmptyState } from '@/components/ui/EmptyState';
import { products, brands } from '@/data/mockData';
import { RFQStatus } from '@/types';

export default function CustomerDashboard() {
  const { state } = useAppState();
  const { user, loading, isCustomer, logout } = useAuth();
  const router = useRouter();
  const { rfqs, quotes } = state;

  if (loading) {
    return (
      <Box maxW="1400px" mx="auto" px={6} py={20} textAlign="center">
        <Text color="gray.400">Loading…</Text>
      </Box>
    );
  }

  if (!isCustomer) {
    if (typeof window !== 'undefined') router.replace('/login');
    return null;
  }

  const handleLogout = () => logout().then(() => router.push('/login'));

  // Filter by logged-in customer in prod; show all in demo when customerId unset
  const myRFQs = user.customerId ? rfqs.filter(r => r.customerId === user.customerId) : rfqs;
  const myQuotes = user.customerId ? quotes.filter(q => q.customerId === user.customerId) : quotes;

  const stats = {
    total: myRFQs.length,
    active: myRFQs.filter(r => ['New', 'Under Review'].includes(r.status)).length,
    pending: myQuotes.filter(q => ['Shared', 'Follow-Up', 'Negotiation'].includes(q.status)).length,
    accepted: myQuotes.filter(q => q.status === 'Accepted').length,
  };

  return (
    <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} color="gray.900">My Dashboard</Text>
          <Text color="gray.500" fontSize="sm" mt={0.5}>
            {user.name} · Track your quotes &amp; orders
          </Text>
        </Box>
        <HStack gap={2}>
          <Link href="/catalogue">
            <Button colorPalette="blue" size="sm">+ New Quote Request</Button>
          </Link>
          <Button size="sm" variant="ghost" colorPalette="red" onClick={handleLogout}>Sign Out</Button>
        </HStack>
      </Flex>

      {/* KPIs */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={8}>
        <KPICard label="Total RFQs" value={stats.total} icon="📋" colorScheme="blue" />
        <KPICard label="Active RFQs" value={stats.active} icon="⏳" colorScheme="orange" />
        <KPICard label="Pending Quotes" value={stats.pending} icon="💬" colorScheme="purple" />
        <KPICard label="Accepted Quotes" value={stats.accepted} icon="✅" colorScheme="green" />
      </SimpleGrid>

      {/* Tabs */}
      <TabsRoot defaultValue="rfqs">
        <TabsList mb={5} borderBottom="1px solid" borderColor="gray.100">
          <TabsTrigger value="rfqs">My RFQs ({myRFQs.length})</TabsTrigger>
          <TabsTrigger value="quotes">My Quotes ({myQuotes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="rfqs">
          {myRFQs.length === 0 ? (
            <EmptyState icon="📋" title="No RFQs yet" description="Submit your first quote request." action={<Link href="/catalogue"><Button colorPalette="blue" size="sm">Browse Products</Button></Link>} />
          ) : (
            <VStack gap={3} align="stretch">
              {myRFQs.map(rfq => (
                <Box key={rfq.id} bg="white" rounded="xl" p={4} border="1px solid" borderColor="gray.100" shadow="sm">
                  <Flex justify="space-between" align="flex-start" gap={3} flexWrap="wrap">
                    <Box>
                      <HStack gap={2} mb={1}>
                        <Text fontWeight={700} fontSize="sm" color="blue.700" fontFamily="mono">{rfq.rfqNumber}</Text>
                        <StatusBadge status={rfq.status} />
                      </HStack>
                      <Text fontWeight={600} color="gray.800">{rfq.projectName}</Text>
                      <HStack gap={3} mt={1} flexWrap="wrap">
                        <Text fontSize="xs" color="gray.500">📦 {rfq.items.length} products</Text>
                        <Text fontSize="xs" color="gray.500">📅 {rfq.createdAt}</Text>
                        <Text fontSize="xs" color="gray.500">📍 {rfq.deliveryLocation}</Text>
                      </HStack>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="gray.500" mb={2}>Products ordered:</Text>
                      <HStack gap={1} flexWrap="wrap">
                        {rfq.items.slice(0, 3).map(item => {
                          const p = products.find(x => x.id === item.productId);
                          const b = brands.find(x => x.id === p?.brandId);
                          return (
                            <Box key={item.productId} bg="gray.50" rounded="lg" w="36px" h="36px" display="flex" alignItems="center" justifyContent="center" overflow="hidden" title={p?.name}>
                              <img src={p?.imageUrl} alt={p?.name || ''}
                                style={{ maxHeight: '30px', maxWidth: '30px', objectFit: 'contain' }}
                                onError={(e) => { e.currentTarget.src = `https://placehold.co/30x30/e2e8f0/718096?text=P` }}
                              />
                            </Box>
                          );
                        })}
                        {rfq.items.length > 3 && (
                          <Box bg="gray.100" rounded="lg" w="36px" h="36px" display="flex" alignItems="center" justifyContent="center">
                            <Text fontSize="10px" color="gray.500">+{rfq.items.length - 3}</Text>
                          </Box>
                        )}
                      </HStack>
                    </Box>
                  </Flex>
                </Box>
              ))}
            </VStack>
          )}
        </TabsContent>

        <TabsContent value="quotes">
          {myQuotes.length === 0 ? (
            <EmptyState icon="💬" title="No quotes yet" description="Quotes from our team will appear here once your RFQ is reviewed." />
          ) : (
            <VStack gap={3} align="stretch">
              {myQuotes.map(quote => {
                const subtotal = quote.lineItems.reduce((sum, li) => {
                  const after = li.basePrice * (1 - li.discount / 100);
                  const withTax = after * (1 + li.tax / 100);
                  return sum + withTax * li.quantity;
                }, 0);
                const total = subtotal + quote.deliveryCharges;
                return (
                  <Box key={quote.id} bg="white" rounded="xl" p={4} border="1px solid" borderColor="gray.100" shadow="sm">
                    <Flex justify="space-between" align="flex-start" gap={3} flexWrap="wrap">
                      <Box>
                        <HStack gap={2} mb={1}>
                          <Text fontWeight={700} fontSize="sm" color="green.700" fontFamily="mono">{quote.quoteNumber}</Text>
                          <StatusBadge status={quote.status} />
                        </HStack>
                        <Text fontWeight={600} color="gray.800">{quote.projectName}</Text>
                        <HStack gap={3} mt={1} flexWrap="wrap">
                          <Text fontSize="xs" color="gray.500">📋 {quote.rfqNumber}</Text>
                          <Text fontSize="xs" color="gray.500">📅 {quote.createdAt}</Text>
                          <Text fontSize="xs" color="gray.500">Valid: {quote.validUntil}</Text>
                        </HStack>
                      </Box>
                      <Box textAlign="right">
                        <Text fontSize="xs" color="gray.500">Quote Value</Text>
                        <Text fontWeight={800} fontSize="lg" color="gray.900">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
                        <Text fontSize="xs" color="gray.400">{quote.lineItems.length} items incl. taxes</Text>
                        {quote.status === 'Shared' && (
                          <Link href={`/quotation/${quote.id}`}>
                            <Button size="sm" colorPalette="blue" mt={2} rounded="lg">View Quote</Button>
                          </Link>
                        )}
                      </Box>
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          )}
        </TabsContent>
      </TabsRoot>
    </Box>
  );
}
