'use client';

import {
  Box, Text, Button, HStack, VStack, Flex, Separator, SimpleGrid,
  DrawerRoot, DrawerBackdrop, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseTrigger,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { products, brands } from '@/data/mockData';
import { PurchaseOrder } from '@/types';
import { toaster } from '@/components/ui/toaster';

export default function PurchaseOrdersPage() {
  const { state } = useAppState();
  const [selected, setSelected] = useState<PurchaseOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const lineTotal = (li: PurchaseOrder['lineItems'][0]) => {
    const after = li.basePrice * (1 - li.discount / 100);
    return after * (1 + li.tax / 100) * li.quantity;
  };
  const grandTotal = (po: PurchaseOrder) => po.lineItems.reduce((s, li) => s + lineTotal(li), 0) + po.deliveryCharges;

  const handlePrint = () => toaster.create({ title: 'Print initiated (demo)', type: 'info', duration: 2000 });
  const handleDownload = () => toaster.create({ title: 'PDF download simulated (demo)', type: 'info', duration: 2000 });
  const handleSend = () => toaster.create({ title: 'PO sent to customer (demo)', type: 'success', duration: 2000 });

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader title="Purchase Orders" subtitle={`${state.purchaseOrders.length} total POs`} />

      {state.purchaseOrders.length === 0 ? (
        <EmptyState icon="🛒" title="No purchase orders yet" description="POs are generated automatically when a quote is marked Won." />
      ) : (
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: '700px' }}>
              <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Box as="tr">
                  {['PO Number', 'Quote Ref', 'Customer', 'Company', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                    <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide" whiteSpace="nowrap">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {state.purchaseOrders.map(po => (
                  <Box as="tr" key={po.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'gray.50' }}>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={700} color="teal.700" fontFamily="mono">{po.poNumber}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" fontFamily="mono" color="green.700">{po.quoteNumber}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={600}>{po.customerName}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.600">{po.companyName}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="xs" color="gray.600">{po.poDate}</Text></Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" fontWeight={700}>₹{grandTotal(po).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text></Box>
                    <Box as="td" px={4} py={3}><StatusBadge status={po.status} /></Box>
                    <Box as="td" px={4} py={3}>
                      <Button size="xs" variant="outline" colorPalette="blue" onClick={() => { setSelected(po); setDrawerOpen(true); }}>View</Button>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <DrawerRoot open={drawerOpen} onOpenChange={d => setDrawerOpen(d.open)} placement="end" size="lg">
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerHeader borderBottom="1px solid" borderColor="gray.100">
            <Text fontWeight={800} fontFamily="mono" color="teal.700">{selected?.poNumber}</Text>
            <DrawerCloseTrigger />
          </DrawerHeader>
          <DrawerBody py={4} overflowY="auto">
            {selected && (
              <VStack gap={5} align="stretch">
                <SimpleGrid columns={2} gap={3}>
                  {[['Customer', selected.customerName], ['Company', selected.companyName], ['Quote Ref', selected.quoteNumber], ['RFQ Ref', selected.rfqNumber], ['PO Date', selected.poDate], ['Status', selected.status]].map(([l, v]) => (
                    <Box key={l}><Text fontSize="xs" color="gray.500">{l}</Text><Text fontSize="sm" fontWeight={600}>{v}</Text></Box>
                  ))}
                </SimpleGrid>
                <Box>
                  <Text fontSize="xs" color="gray.500">Billing Address</Text>
                  <Text fontSize="sm" fontWeight={600}>{selected.billingAddress}</Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500">Delivery Address</Text>
                  <Text fontSize="sm" fontWeight={600}>{selected.deliveryAddress}</Text>
                </Box>
                <Separator />
                <Box>
                  <Text fontWeight={700} fontSize="sm" color="gray.600" mb={2} textTransform="uppercase" letterSpacing="wide">Products</Text>
                  <VStack gap={2} align="stretch">
                    {selected.lineItems.map(li => {
                      const p = products.find(x => x.id === li.productId);
                      const b = brands.find(x => x.id === p?.brandId);
                      return (
                        <Flex key={li.productId} justify="space-between" bg="gray.50" rounded="lg" px={3} py={2.5}>
                          <Box>
                            <Text fontSize="sm" fontWeight={600}>{p?.name}</Text>
                            <Text fontSize="xs" color="gray.500">{b?.name} · SKU: {p?.sku} · Qty: {li.quantity}</Text>
                          </Box>
                          <Box textAlign="right">
                            <Text fontSize="xs" color="gray.500">₹{li.basePrice} -{li.discount}% +{li.tax}%</Text>
                            <Text fontSize="sm" fontWeight={700}>₹{lineTotal(li).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text>
                          </Box>
                        </Flex>
                      );
                    })}
                  </VStack>
                  <Flex justify="flex-end" mt={3}>
                    <VStack align="stretch" minW="200px" gap={1} bg="teal.50" p={3} rounded="lg">
                      <Flex justify="space-between"><Text fontSize="xs" color="gray.600">Delivery</Text><Text fontSize="xs">₹{selected.deliveryCharges.toLocaleString()}</Text></Flex>
                      <Flex justify="space-between"><Text fontWeight={700}>Total</Text><Text fontWeight={800} color="teal.700">₹{grandTotal(selected).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</Text></Flex>
                    </VStack>
                  </Flex>
                </Box>
                <Box bg="gray.50" p={3} rounded="lg">
                  <Text fontSize="xs" fontWeight={600} color="gray.600" mb={1}>Terms</Text>
                  <Text fontSize="xs" color="gray.500">{selected.terms}</Text>
                </Box>
                <VStack gap={2} align="stretch">
                  <Button colorPalette="blue" onClick={handleSend}>📤 Send to Customer</Button>
                  <HStack gap={2}>
                    <Button variant="outline" colorPalette="gray" flex={1} onClick={handlePrint}>🖨️ Print</Button>
                    <Button variant="outline" colorPalette="gray" flex={1} onClick={handleDownload}>⬇️ Download PDF</Button>
                  </HStack>
                </VStack>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </DrawerRoot>
    </Box>
  );
}
