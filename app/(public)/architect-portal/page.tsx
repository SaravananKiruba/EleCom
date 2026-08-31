'use client';

import {
  Box, Text, Flex, SimpleGrid, VStack, HStack, Button, Separator,
  TabsRoot, TabsList, TabsTrigger, TabsContent,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ArchitectPortalPage() {
  const { state } = useAppState();
  const { user, loading, isArchitect, logout } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <Box maxW="1200px" mx="auto" px={6} py={20} textAlign="center">
        <Text color="gray.400">Loadingâ€¦</Text>
      </Box>
    );
  }

  if (!isArchitect) {
    if (typeof window !== 'undefined') router.replace('/login');
    return null;
  }

  const handleLogout = () => logout().then(() => router.push('/login'));

  const myRFQs = state.rfqs.filter(r => r.customerId === user.customerId).concat(
    user.customerId ? [] : state.rfqs.slice(0, 5)
  );
  const myQuotes = state.quotes.filter(q => q.customerId === user.customerId).concat(
    user.customerId ? [] : state.quotes.slice(0, 5)
  );
  const architect = state.architects.find(a => a.id === user.architectId) ?? state.architects[0];

  return (
    <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
      {/* Page Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} color="gray.900">Architect Portal</Text>
          <Text color="gray.500" fontSize="sm">Welcome back, {user.name}</Text>
        </Box>
        <HStack gap={2}>
          <Link href="/rfq"><Button colorPalette="blue" size="sm">Submit RFQ</Button></Link>
          <Link href="/catalogue"><Button variant="outline" colorPalette="gray" size="sm">Browse Products</Button></Link>
          <Button size="sm" variant="ghost" colorPalette="red" onClick={handleLogout}>Sign Out</Button>
        </HStack>
      </Flex>

      {/* Discount Hero Card */}
      {architect && (
        <Box
          bg="linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)"
          rounded="2xl" p={{ base: 5, md: 7 }} mb={8} color="white"
          shadow="lg"
        >
          <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={5}>
            <Box>
              <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight={800} mb={1}>{architect.firmName}</Text>
              <Text color="blue.200" fontSize="sm">{architect.name}</Text>
              <HStack gap={4} mt={2} flexWrap="wrap">
                <Text fontSize="xs" color="blue.300">ðŸ“ {architect.city}</Text>
                <Text fontSize="xs" color="blue.300">ðŸªª Lic: {architect.licenseNumber}</Text>
                {architect.specialization && <Text fontSize="xs" color="blue.300">ðŸŽ¯ {architect.specialization}</Text>}
              </HStack>
            </Box>
            <Box bg="whiteAlpha.100" rounded="xl" px={6} py={4} textAlign="center" backdropFilter="blur(8px)">
              <Text fontSize="xs" color="blue.200" mb={1} textTransform="uppercase" letterSpacing="wide">Your Discount Rate</Text>
              <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight={900} color="green.300" lineHeight={1}>
                {architect.discount ? `${architect.discount}%` : 'â€”'}
              </Text>
              {architect.discountExpiry && (
                <Text fontSize="10px" color="blue.300" mt={1}>
                  Valid till {new Date(architect.discountExpiry).toLocaleDateString('en-IN')}
                </Text>
              )}
            </Box>
          </Flex>
        </Box>
      )}

      {/* KPIs */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={8}>
        <KPICard label="Total RFQs" value={myRFQs.length} icon="ðŸ“‹" colorScheme="blue" />
        <KPICard label="Active Quotes" value={myQuotes.filter(q => ['Shared', 'Follow-Up', 'Negotiation'].includes(q.status)).length} icon="ðŸ’¬" colorScheme="purple" />
        <KPICard label="Won Orders" value={myQuotes.filter(q => q.status === 'Accepted').length} icon="ðŸ†" colorScheme="green" />
        <KPICard label="Discount Tier" value={architect?.discount ? `${architect.discount}%` : 'â€”'} icon="ðŸ·ï¸" colorScheme="orange" />
      </SimpleGrid>

      {/* Tabs */}
      <TabsRoot defaultValue="rfqs">
        <TabsList borderBottom="1px solid" borderColor="gray.100" mb={6} overflowX="auto">
          <TabsTrigger value="rfqs" whiteSpace="nowrap">My RFQs ({myRFQs.length})</TabsTrigger>
          <TabsTrigger value="quotes" whiteSpace="nowrap">My Quotes ({myQuotes.length})</TabsTrigger>
          <TabsTrigger value="discount" whiteSpace="nowrap">Discount History</TabsTrigger>
        </TabsList>

        <TabsContent value="rfqs">
          {myRFQs.length === 0 ? (
            <EmptyState icon="ðŸ“‹" title="No RFQs yet"
              action={<Link href="/catalogue"><Button size="sm" colorPalette="blue">Browse Products</Button></Link>}
            />
          ) : (
            <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
              <Box overflowX="auto">
                <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: '500px' }}>
                  <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                    <Box as="tr">
                      {['RFQ No.', 'Project', 'Delivery Location', 'Date', 'Status'].map(h => (
                        <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" whiteSpace="nowrap">{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {myRFQs.map(r => (
                      <Box as="tr" key={r.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'gray.50' }}>
                        <Box as="td" px={4} py={3}><Text fontSize="sm" fontFamily="mono" fontWeight={600} color="blue.700">{r.rfqNumber}</Text></Box>
                        <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={500} color="gray.800">{r.projectName}</Text></Box>
                        <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.500">{r.deliveryLocation}</Text></Box>
                        <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.400">{new Date(r.createdAt).toLocaleDateString('en-IN')}</Text></Box>
                        <Box as="td" px={4} py={3}><StatusBadge status={r.status} /></Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </TabsContent>

        <TabsContent value="quotes">
          {myQuotes.length === 0 ? (
            <EmptyState icon="ðŸ’¬" title="No quotes yet" description="Quotes appear here once your RFQ is processed." />
          ) : (
            <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
              <Box overflowX="auto">
                <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: '500px' }}>
                  <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                    <Box as="tr">
                      {['Quote No.', 'Project', 'Valid Until', 'Status', ''].map(h => (
                        <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase">{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {myQuotes.map(q => (
                      <Box as="tr" key={q.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'gray.50' }}>
                        <Box as="td" px={4} py={3}><Text fontSize="sm" fontFamily="mono" fontWeight={600} color="green.700">{q.quoteNumber}</Text></Box>
                        <Box as="td" px={4} py={3}><Text fontSize="sm" color="gray.800">{q.projectName}</Text></Box>
                        <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.400">{q.validUntil ? new Date(q.validUntil).toLocaleDateString('en-IN') : 'â€”'}</Text></Box>
                        <Box as="td" px={4} py={3}><StatusBadge status={q.status} /></Box>
                        <Box as="td" px={4} py={3}>
                          <Link href={`/quotation/${q.id}`}>
                            <Button size="xs" variant="ghost" colorPalette="blue">View â†’</Button>
                          </Link>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </TabsContent>

        <TabsContent value="discount">
          {!architect?.discountHistory?.length ? (
            <EmptyState icon="ðŸ·ï¸" title="No discount history" description="Discount changes will appear here." />
          ) : (
            <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
              <Box as="table" w="full" style={{ borderCollapse: 'collapse' }}>
                <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                  <Box as="tr">
                    {['Date', 'Previous Rate', 'New Rate', 'Changed By'].map(h => (
                      <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase">{h}</Box>
                    ))}
                  </Box>
                </Box>
                <Box as="tbody">
                  {architect.discountHistory.map((d, i) => (
                    <Box as="tr" key={i} borderTop="1px solid" borderColor="gray.50">
                      <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.400">{new Date(d.date).toLocaleDateString('en-IN')}</Text></Box>
                      <Box as="td" px={4} py={3}><Text fontSize="sm" color="red.400" fontWeight={600}>{d.previous}%</Text></Box>
                      <Box as="td" px={4} py={3}><Text fontSize="sm" color="green.600" fontWeight={700}>{d.next}%</Text></Box>
                      <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.500">{d.changedBy}</Text></Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}
        </TabsContent>
      </TabsRoot>
    </Box>
  );
}

