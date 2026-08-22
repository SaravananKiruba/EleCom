'use client';

import {
  Box, Text, Button, HStack, VStack, Flex, SimpleGrid, Input, Textarea,
  Field,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/context/AppContext';
import { products, brands } from '@/data/mockData';
import { RFQ } from '@/types';
import { EmptyState } from '@/components/ui/EmptyState';

function generateRFQNumber() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `RFQ-2026-${num}`;
}

export default function RFQPage() {
  const { state, dispatch } = useAppState();
  const router = useRouter();
  const { cartItems } = state;

  const [form, setForm] = useState({
    customerName: '', companyName: '', mobile: '', whatsapp: '', email: '',
    projectName: '', deliveryLocation: '', requiredDeliveryDate: '', additionalRequirements: '', remarks: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<RFQ | null>(null);

  const required = ['customerName', 'companyName', 'mobile', 'email', 'projectName', 'deliveryLocation'];

  const validate = () => {
    const e: Record<string, string> = {};
    required.forEach(k => {
      if (!form[k as keyof typeof form].trim()) e[k] = 'This field is required.';
    });
    if (form.mobile && !/^\d{10}$/.test(form.mobile)) e.mobile = 'Enter a valid 10-digit mobile number.';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address.';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const rfqNumber = generateRFQNumber();
    const rfq: RFQ = {
      id: `rfq-${Date.now()}`,
      rfqNumber,
      customerId: 'cust-self',
      ...form,
      items: cartItems.map(i => ({ productId: i.productId, quantity: i.quantity })),
      status: 'New',
      createdAt: new Date().toISOString().split('T')[0],
      timeline: [{ date: new Date().toISOString().split('T')[0], action: 'RFQ Created', by: 'Customer' }],
    };
    dispatch({ type: 'ADD_RFQ', payload: rfq });
    dispatch({ type: 'CLEAR_CART' });
    setSubmitted(rfq);
  };

  const set = (k: string, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  if (cartItems.length === 0 && !submitted) {
    return (
      <Box maxW="900px" mx="auto" px={{ base: 4, md: 6 }} py={10}>
        <EmptyState
          icon="📋"
          title="No products in your quote cart"
          description="Add products to your cart before submitting a quote request."
          action={<Link href="/catalogue"><Button colorPalette="blue">Browse Products</Button></Link>}
        />
      </Box>
    );
  }

  if (submitted) {
    return (
      <Box maxW="680px" mx="auto" px={{ base: 4, md: 6 }} py={10} textAlign="center">
        <Box bg="green.50" rounded="2xl" p={10} border="1px solid" borderColor="green.100" shadow="sm">
          <Text fontSize="4xl" mb={4}>✅</Text>
          <Text fontSize="2xl" fontWeight={800} color="gray.900" mb={2}>Quote Request Submitted!</Text>
          <Text color="gray.600" fontSize="md" mb={6}>
            Our team will review your requirement and get back to you within 24 hours.
          </Text>
          <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" mb={6} textAlign="left">
            <SimpleGrid columns={2} gap={3}>
              {[
                ['RFQ Number', submitted.rfqNumber],
                ['Date', submitted.createdAt],
                ['Status', 'New'],
                ['Products', `${submitted.items.length} items`],
              ].map(([label, val]) => (
                <Box key={label}>
                  <Text fontSize="xs" color="gray.500" fontWeight={500}>{label}</Text>
                  <Text fontSize="sm" fontWeight={700} color="gray.900">{val}</Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
          <HStack gap={3} justify="center" flexWrap="wrap">
            <Link href="/dashboard">
              <Button colorPalette="blue" size="lg" rounded="xl">View My RFQs</Button>
            </Link>
            <Link href="/catalogue">
              <Button variant="outline" colorPalette="gray" size="lg" rounded="xl">Continue Browsing</Button>
            </Link>
          </HStack>
        </Box>
      </Box>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={6}>
      <HStack gap={1} mb={5} fontSize="sm" color="gray.500">
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
        <Text>/</Text>
        <Link href="/quote-cart" style={{ textDecoration: 'none', color: 'inherit' }}>Quote Cart</Link>
        <Text>/</Text>
        <Text color="gray.800" fontWeight={500}>Request Quote</Text>
      </HStack>

      <Text fontSize="2xl" fontWeight={700} color="gray.900" mb={1}>Request a Quote</Text>
      <Text color="gray.500" fontSize="sm" mb={6}>Fill in your details and we&apos;ll get back with competitive pricing.</Text>

      <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} alignItems="flex-start">
        {/* Form */}
        <Box gridColumn={{ lg: 'span 2' }}>
          <Box as="form" onSubmit={handleSubmit} bg="white" rounded="2xl" p={{ base: 4, md: 6 }} border="1px solid" borderColor="gray.100" shadow="sm">
            <Text fontWeight={700} fontSize="md" color="gray.700" mb={4}>Contact Information</Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={4}>
              {[
                { key: 'customerName', label: 'Your Name', ph: 'Rajesh Kumar', req: true },
                { key: 'companyName', label: 'Company Name', ph: 'Kumar Constructions', req: true },
                { key: 'mobile', label: 'Mobile Number', ph: '9876543210', req: true },
                { key: 'whatsapp', label: 'WhatsApp Number', ph: '9876543210', req: false },
                { key: 'email', label: 'Email Address', ph: 'name@company.com', req: true },
              ].map(f => (
                <Field.Root key={f.key} invalid={!!errors[f.key]}>
                  <Field.Label fontSize="sm" fontWeight={600} color="gray.700">
                    {f.label} {f.req && <Text as="span" color="red.500">*</Text>}
                  </Field.Label>
                  <Input
                    placeholder={f.ph}
                    value={form[f.key as keyof typeof form]}
                    onChange={e => set(f.key, e.target.value)}
                    borderColor={errors[f.key] ? 'red.300' : 'gray.200'}
                    _focus={{ borderColor: 'blue.400' }}
                  />
                  {errors[f.key] && <Field.ErrorText>{errors[f.key]}</Field.ErrorText>}
                </Field.Root>
              ))}
            </SimpleGrid>

            <Text fontWeight={700} fontSize="md" color="gray.700" mb={4} mt={2}>Project Details</Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={4}>
              <Field.Root invalid={!!errors.projectName}>
                <Field.Label fontSize="sm" fontWeight={600} color="gray.700">
                  Project Name <Text as="span" color="red.500">*</Text>
                </Field.Label>
                <Input placeholder="Andheri Office Complex" value={form.projectName} onChange={e => set('projectName', e.target.value)} borderColor={errors.projectName ? 'red.300' : 'gray.200'} _focus={{ borderColor: 'blue.400' }} />
                {errors.projectName && <Field.ErrorText>{errors.projectName}</Field.ErrorText>}
              </Field.Root>
              <Field.Root invalid={!!errors.deliveryLocation}>
                <Field.Label fontSize="sm" fontWeight={600} color="gray.700">
                  Delivery Location <Text as="span" color="red.500">*</Text>
                </Field.Label>
                <Input placeholder="City, State" value={form.deliveryLocation} onChange={e => set('deliveryLocation', e.target.value)} borderColor={errors.deliveryLocation ? 'red.300' : 'gray.200'} _focus={{ borderColor: 'blue.400' }} />
                {errors.deliveryLocation && <Field.ErrorText>{errors.deliveryLocation}</Field.ErrorText>}
              </Field.Root>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600} color="gray.700">Required Delivery Date</Field.Label>
                <Input type="date" value={form.requiredDeliveryDate} onChange={e => set('requiredDeliveryDate', e.target.value)} borderColor="gray.200" _focus={{ borderColor: 'blue.400' }} />
              </Field.Root>
            </SimpleGrid>

            <Field.Root mb={4}>
              <Field.Label fontSize="sm" fontWeight={600} color="gray.700">Additional Requirements</Field.Label>
              <Textarea placeholder="Any specific brand, certification, or technical requirements..." value={form.additionalRequirements} onChange={e => set('additionalRequirements', e.target.value)} rows={3} borderColor="gray.200" _focus={{ borderColor: 'blue.400' }} />
            </Field.Root>

            <Field.Root mb={6}>
              <Field.Label fontSize="sm" fontWeight={600} color="gray.700">Remarks</Field.Label>
              <Textarea placeholder="Any other notes for our team..." value={form.remarks} onChange={e => set('remarks', e.target.value)} rows={2} borderColor="gray.200" _focus={{ borderColor: 'blue.400' }} />
            </Field.Root>

            <Button type="submit" colorPalette="blue" size="lg" w="full" rounded="xl" fontWeight={700}>
              Submit Quote Request
            </Button>
          </Box>
        </Box>

        {/* Product summary */}
        <Box>
          <Box bg="white" rounded="xl" p={5} border="1px solid" borderColor="gray.100" shadow="sm" position={{ lg: 'sticky' }} top="80px">
            <Text fontWeight={700} fontSize="sm" color="gray.700" mb={3}>
              Selected Products ({cartItems.length})
            </Text>
            <VStack gap={3} align="stretch">
              {cartItems.map(item => {
                const product = products.find(p => p.id === item.productId);
                const brand = brands.find(b => b.id === product?.brandId);
                if (!product) return null;
                return (
                  <Flex key={item.productId} gap={3} align="center">
                    <Box bg="gray.50" rounded="lg" w="40px" h="40px" flexShrink={0} display="flex" alignItems="center" justifyContent="center" overflow="hidden">
                      <img src={product.imageUrl} alt={product.name}
                        style={{ maxHeight: '36px', maxWidth: '36px', objectFit: 'contain' }}
                        onError={(e) => { e.currentTarget.src = `https://placehold.co/36x36/e2e8f0/718096?text=P` }}
                      />
                    </Box>
                    <Box flex={1} minW={0}>
                      <Text fontSize="xs" fontWeight={600} color="gray.800" lineHeight="short" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</Text>
                      <Text fontSize="xs" color="gray.500">Qty: {item.quantity}</Text>
                    </Box>
                  </Flex>
                );
              })}
            </VStack>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
