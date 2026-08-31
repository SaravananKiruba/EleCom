'use client';

import {
  Box, Text, Button, HStack, VStack, Flex, SimpleGrid, Separator,
  TabsRoot, TabsList, TabsTrigger, TabsContent,
} from '@chakra-ui/react';
import { useState, useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { KPICard } from '@/components/ui/KPICard';
import { products, brands, categories } from '@/data/mockData';
import { downloadCSV } from '@/utils/csvExport';

function BarChart({ data, color = '#4299e1' }: { data: { label: string; value: number }[]; color?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <VStack gap={2} align="stretch">
      {data.map(d => (
        <Box key={d.label}>
          <Flex justify="space-between" mb={1}>
            <Text fontSize="xs" color="gray.600" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</Text>
            <Text fontSize="xs" fontWeight={700}>{d.value}</Text>
          </Flex>
          <Box bg="gray.100" rounded="full" h={2}>
            <Box bg={color} rounded="full" h={2} w={`${(d.value / max) * 100}%`} transition="width 0.5s" />
          </Box>
        </Box>
      ))}
    </VStack>
  );
}

export default function ReportsPage() {
  const { state } = useAppState();
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-12-31');

  const { rfqs: allRfqs, quotes: allQuotes, customers, purchaseOrders } = state;

  // Filter by date range
  const rfqs = useMemo(() => allRfqs.filter(r => r.createdAt >= dateFrom && r.createdAt <= dateTo + 'T23:59:59'), [allRfqs, dateFrom, dateTo]);
  const quotes = useMemo(() => allQuotes.filter(q => q.createdAt >= dateFrom && q.createdAt <= dateTo + 'T23:59:59'), [allQuotes, dateFrom, dateTo]);

  // Stats
  const wonCount = quotes.filter(q => q.status === 'Accepted').length;
  const lostCount = quotes.filter(q => q.status === 'Rejected').length;
  const conversionRate = quotes.length ? Math.round((wonCount / quotes.length) * 100) : 0;

  const quoteValue = (q: typeof quotes[0]) => q.lineItems.reduce((s, li) => {
    const after = li.basePrice * (1 - li.discount / 100) * (1 + li.tax / 100);
    return s + after * li.quantity;
  }, 0) + q.deliveryCharges;

  const totalQuoteValue = quotes.filter(q => q.status === 'Accepted').reduce((s, q) => s + quoteValue(q), 0);

  // Product demand
  const productDemand: Record<string, number> = {};
  rfqs.forEach(r => r.items.forEach(i => { productDemand[i.productId] = (productDemand[i.productId] || 0) + i.quantity; }));
  const topProducts = Object.entries(productDemand).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id, qty]) => {
    const p = products.find(x => x.id === id);
    return { label: p?.name || 'Unknown', value: qty };
  });

  // Brand demand
  const brandDemand: Record<string, number> = {};
  rfqs.forEach(r => r.items.forEach(i => {
    const p = products.find(x => x.id === i.productId);
    if (p) brandDemand[p.brandId] = (brandDemand[p.brandId] || 0) + i.quantity;
  }));
  const topBrands = Object.entries(brandDemand).sort((a, b) => b[1] - a[1]).map(([id, qty]) => {
    const b = brands.find(x => x.id === id);
    return { label: b?.name || 'Unknown', value: qty };
  });

  // Category demand
  const catDemand: Record<string, number> = {};
  rfqs.forEach(r => r.items.forEach(i => {
    const p = products.find(x => x.id === i.productId);
    if (p) catDemand[p.categoryId] = (catDemand[p.categoryId] || 0) + 1;
  }));
  const topCategories = Object.entries(catDemand).sort((a, b) => b[1] - a[1]).map(([id, cnt]) => {
    const c = categories.find(x => x.id === id);
    return { label: c?.name || 'Unknown', value: cnt };
  });

  // RFQ by status
  const rfqByStatus = ['New', 'Under Review', 'Quote Ready', 'Follow-Up', 'Accepted', 'Rejected', 'Expired'].map(s => ({
    label: s, value: rfqs.filter(r => r.status === s).length,
  }));

  // Customer-wise quotes
  const custQuotes = customers.map(c => ({
    label: c.companyName, value: quotes.filter(q => q.customerId === c.id).length,
  })).filter(c => c.value > 0).sort((a, b) => b.value - a.value);

  // Lost reasons
  const lostReasonMap: Record<string, number> = {};
  quotes.filter(q => q.lostReason).forEach(q => {
    lostReasonMap[q.lostReason!] = (lostReasonMap[q.lostReason!] || 0) + 1;
  });
  const lostReasons = Object.entries(lostReasonMap).map(([label, value]) => ({ label, value }));

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader title="Reports" subtitle="Business intelligence and analytics"
        actions={
          <Button size="sm" variant="outline" colorPalette="green"
            onClick={() => downloadCSV(quotes.map(q => ({ Quote: q.quoteNumber, Customer: q.customerName, Project: q.projectName, Status: q.status, Value: quoteValue(q).toFixed(2), Date: q.createdAt })), 'quotes-report.csv')}>
            ↓ Export CSV
          </Button>
        }
      />

      {/* Date Filter */}
      <Flex gap={3} mb={6} flexWrap="wrap" align="center">
        <HStack gap={2}>
          <Text fontSize="sm" color="gray.600">From:</Text>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
        </HStack>
        <HStack gap={2}>
          <Text fontSize="sm" color="gray.600">To:</Text>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
        </HStack>
      </Flex>

      {/* Summary KPIs */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4} mb={8}>
        <KPICard label="Total RFQs" value={rfqs.length} icon="📋" colorScheme="blue" />
        <KPICard label="Total Quotes" value={quotes.length} icon="💬" colorScheme="purple" />
        <KPICard label="Won Quotes" value={wonCount} icon="🏆" colorScheme="green" sub={`Conversion: ${conversionRate}%`} />
        <KPICard label="Won Value" value={`₹${(totalQuoteValue / 100000).toFixed(1)}L`} icon="💰" colorScheme="teal" />
      </SimpleGrid>

      <TabsRoot defaultValue="products">
        <TabsList borderBottom="1px solid" borderColor="gray.100" mb={6} overflowX="auto">
          <TabsTrigger value="products" whiteSpace="nowrap">Products</TabsTrigger>
          <TabsTrigger value="brands" whiteSpace="nowrap">Brands</TabsTrigger>
          <TabsTrigger value="rfq-status" whiteSpace="nowrap">RFQ Status</TabsTrigger>
          <TabsTrigger value="customers" whiteSpace="nowrap">Customers</TabsTrigger>
          <TabsTrigger value="lost" whiteSpace="nowrap">Lost Analysis</TabsTrigger>
          <TabsTrigger value="categories" whiteSpace="nowrap">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm">
            <Text fontWeight={700} color="gray.800" mb={4}>Most Requested Products (by Quantity)</Text>
            {topProducts.length > 0 ? <BarChart data={topProducts} color="#4299e1" /> : <Text fontSize="sm" color="gray.400">No data</Text>}
          </Box>
        </TabsContent>

        <TabsContent value="brands">
          <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm">
            <Text fontWeight={700} color="gray.800" mb={4}>Brand Demand (by Units Requested)</Text>
            {topBrands.length > 0 ? <BarChart data={topBrands} color="#9f7aea" /> : <Text fontSize="sm" color="gray.400">No data</Text>}
          </Box>
        </TabsContent>

        <TabsContent value="rfq-status">
          <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm">
            <Text fontWeight={700} color="gray.800" mb={4}>RFQ Status Distribution</Text>
            <BarChart data={rfqByStatus.filter(d => d.value > 0)} color="#f6ad55" />
            <Separator my={5} />
            <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
              <Box bg="blue.50" rounded="lg" p={3} textAlign="center">
                <Text fontSize="2xl" fontWeight={800} color="blue.700">{rfqs.length}</Text>
                <Text fontSize="xs" color="blue.600">Total RFQs</Text>
              </Box>
              <Box bg="green.50" rounded="lg" p={3} textAlign="center">
                <Text fontSize="2xl" fontWeight={800} color="green.700">{rfqs.filter(r => r.status === 'Accepted').length}</Text>
                <Text fontSize="xs" color="green.600">Accepted</Text>
              </Box>
              <Box bg="orange.50" rounded="lg" p={3} textAlign="center">
                <Text fontSize="2xl" fontWeight={800} color="orange.700">{rfqs.filter(r => r.status === 'New').length}</Text>
                <Text fontSize="xs" color="orange.600">New / Pending</Text>
              </Box>
              <Box bg="purple.50" rounded="lg" p={3} textAlign="center">
                <Text fontSize="2xl" fontWeight={800} color="purple.700">{quotes.length}</Text>
                <Text fontSize="xs" color="purple.600">Quotes Issued</Text>
              </Box>
            </SimpleGrid>
          </Box>
        </TabsContent>

        <TabsContent value="customers">
          <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm">
            <Text fontWeight={700} color="gray.800" mb={4}>Customer-wise Quote Activity</Text>
            {custQuotes.length > 0 ? <BarChart data={custQuotes} color="#68d391" /> : <Text fontSize="sm" color="gray.400">No data</Text>}
          </Box>
        </TabsContent>

        <TabsContent value="lost">
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm">
              <Text fontWeight={700} color="gray.800" mb={4}>Won vs Lost</Text>
              <SimpleGrid columns={2} gap={4} mb={4}>
                <Box bg="green.50" rounded="xl" p={4} textAlign="center">
                  <Text fontSize="3xl" fontWeight={800} color="green.700">{wonCount}</Text>
                  <Text fontSize="sm" color="green.600" fontWeight={600}>Won</Text>
                </Box>
                <Box bg="red.50" rounded="xl" p={4} textAlign="center">
                  <Text fontSize="3xl" fontWeight={800} color="red.700">{lostCount}</Text>
                  <Text fontSize="sm" color="red.600" fontWeight={600}>Lost</Text>
                </Box>
              </SimpleGrid>
              <Box bg="gray.100" rounded="full" h={4} overflow="hidden">
                <Box bg="green.400" h={4} w={quotes.length ? `${(wonCount / quotes.length) * 100}%` : '0%'} transition="width 0.5s" />
              </Box>
              <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>Conversion Rate: {conversionRate}%</Text>
            </Box>
            <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm">
              <Text fontWeight={700} color="gray.800" mb={4}>Lost Reasons</Text>
              {lostReasons.length > 0 ? <BarChart data={lostReasons} color="#fc8181" /> : <Text fontSize="sm" color="gray.400">No lost quotes yet</Text>}
            </Box>
          </SimpleGrid>
        </TabsContent>

        <TabsContent value="categories">
          <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm">
            <Text fontWeight={700} color="gray.800" mb={4}>Category Demand (by RFQ frequency)</Text>
            {topCategories.length > 0 ? <BarChart data={topCategories} color="#f6ad55" /> : <Text fontSize="sm" color="gray.400">No data</Text>}
          </Box>
        </TabsContent>
      </TabsRoot>
    </Box>
  );
}
