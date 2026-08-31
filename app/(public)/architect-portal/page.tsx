'use client';

import {
  Box, Text, Flex, SimpleGrid, VStack, HStack, Badge, Button, Separator,
  TabsRoot, TabsList, TabsTrigger, TabsContent,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useAppState } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { KPICard } from '@/components/ui/KPICard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';

export default function ArchitectPortalPage() {
  const { state } = useAppState();
  const { user, logout } = useAuth();

  // In the real app, filter by architectId. Demo shows sample data.
  const myRFQs = state.rfqs.slice(0, 5);
  const myQuotes = state.quotes.slice(0, 5);
  const architect = state.architects.find(a => a.id === user.architectId) ?? state.architects[0];

  return (
    <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} color="gray.900">Architect Portal</Text>
          <Text color="gray.500" fontSize="sm">Welcome, {user.name}</Text>
        </Box>
        <HStack gap={2}>
          <Link href="/catalogue"><Button colorPalette="blue" size="sm">Browse Products</Button></Link>
          <Button size="sm" variant="outline" colorPalette="red" onClick={() => logout()}>Logout</Button>
        </HStack>
      </Flex>

      {/* Profile Card */}
      {architect && (
        <Box bg="linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)" rounded="2xl" p={6} mb={8} color="white">
          <Flex justify="space-between" align="flex-start" flexWrap="wrap" gap={4}>
            <Box>
              <Text fontSize="lg" fontWeight={800}>{architect.firmName}</Text>
              <Text color="blue.200">{architect.name} · {architect.city}</Text>
              <Text fontSize="sm" color="blue.300" mt={1}>Lic: {architect.licenseNumber}</Text>
            </Box>
            <Box textAlign={{ base: 'left', md: 'right' }}>
              <Text fontSize="xs" color="blue.300" mb={1}>Your Discount Rate</Text>
              <Text fontSize="3xl" fontWeight={800} color="green.300">
                {architect.discount ? `${architect.discount}%` : 'Standard'}
              </Text>
              {architect.discountExpiry && (
                <Text fontSize="xs" color="blue.300">Valid till {new Date(architect.discountExpiry).toLocaleDateString('en-IN')}</Text>
              )}
            </Box>
          </Flex>
        </Box>
      )}

      {/* KPIs */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={8}>
        <KPICard label="My RFQs" value={myRFQs.length} icon="📋" colorScheme="blue" />
        <KPICard label="Active Quotes" value={myQuotes.filter(q => ['Shared', 'Follow-Up', 'Negotiation'].includes(q.status)).length} icon="💬" colorScheme="purple" />
        <KPICard label="Won Orders" value={myQuotes.filter(q => q.status === 'Accepted').length} icon="🏆" colorScheme="green" />
        <KPICard label="My Discount" value={architect?.discount ? `${architect.discount}%` : '—'} icon="🏷️" colorScheme="orange" />
      </SimpleGrid>

      <TabsRoot defaultValue="rfqs">
        <TabsList borderBottom="1px solid" borderColor="gray.100" mb={6}>
          <TabsTrigger value="rfqs">My RFQs</TabsTrigger>
          <TabsTrigger value="quotes">My Quotes</TabsTrigger>
          <TabsTrigger value="discount">Discount History</TabsTrigger>
        </TabsList>

        <TabsContent value="rfqs">
          {myRFQs.length === 0 ? (
            <EmptyState icon="📋" title="No RFQs yet" action={<Link href="/catalogue"><Button size="sm" colorPalette="blue">Browse Products</Button></Link>} />
          ) : (
            <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
              <Box overflowX="auto">
                <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: '500px' }}>
                  <Box as="thead" bg="gray.50">
                    <Box as="tr">
                      {['RFQ No.', 'Project', 'Date', 'Status'].map(h => (
                        <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase">{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {myRFQs.map(r => (
                      <Box as="tr" key={r.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'gray.50' }}>
                        <Box as="td" px={4} py={3}><Text fontSize="sm" fontFamily="mono" fontWeight={600} color="blue.700">{r.rfqNumber}</Text></Box>
                        <Box as="td" px={4} py={3}><Text fontSize="sm">{r.projectName}</Text></Box>
                        <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.500">{new Date(r.createdAt).toLocaleDateString('en-IN')}</Text></Box>
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
            <EmptyState icon="💬" title="No quotes yet" />
          ) : (
            <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
              <Box overflowX="auto">
                <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: '500px' }}>
                  <Box as="thead" bg="gray.50">
                    <Box as="tr">
                      {['Quote No.', 'Project', 'Status', 'Action'].map(h => (
                        <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase">{h}</Box>
                      ))}
                    </Box>
                  </Box>
                  <Box as="tbody">
                    {myQuotes.map(q => (
                      <Box as="tr" key={q.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'gray.50' }}>
                        <Box as="td" px={4} py={3}><Text fontSize="sm" fontFamily="mono" fontWeight={600} color="green.700">{q.quoteNumber}</Text></Box>
                        <Box as="td" px={4} py={3}><Text fontSize="sm">{q.projectName}</Text></Box>
                        <Box as="td" px={4} py={3}><StatusBadge status={q.status} /></Box>
                        <Box as="td" px={4} py={3}>
                          <Link href={`/quotation/${q.id}`}><Button size="xs" variant="ghost" colorPalette="blue">View</Button></Link>
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
            <EmptyState icon="🏷️" title="No discount history" />
          ) : (
            <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
              <Box as="table" w="full" style={{ borderCollapse: 'collapse' }}>
                <Box as="thead" bg="gray.50">
                  <Box as="tr">
                    {['Date', 'Previous', 'New', 'Changed By'].map(h => (
                      <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase">{h}</Box>
                    ))}
                  </Box>
                </Box>
                <Box as="tbody">
                  {architect.discountHistory.map((d, i) => (
                    <Box as="tr" key={i} borderTop="1px solid" borderColor="gray.50">
                      <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.500">{new Date(d.date).toLocaleDateString('en-IN')}</Text></Box>
                      <Box as="td" px={4} py={3}><Text fontSize="sm" color="red.500">{d.previous}%</Text></Box>
                      <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={700} color="green.600">{d.next}%</Text></Box>
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
