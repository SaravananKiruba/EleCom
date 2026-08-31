'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Box, Text, Button, HStack, VStack, Flex, SimpleGrid, Input, Field } from '@chakra-ui/react';

export default function ArchitectPartnerPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firmName: '', contactPerson: '', email: '', password: '', phone: '', licenseNumber: '', city: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/architects/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Registration failed'); return; }
      router.push('/login?message=' + encodeURIComponent('Registration submitted. Sign in once approved.'));
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Box>
      <Box bg="linear-gradient(135deg,#37463e,#5a6e63,#6b8375)" color="white" py={{ base: 12, md: 20 }} px={{ base: 4, md: 6 }}>
        <Box maxW="1200px" mx="auto" textAlign="center">
          <Text fontSize={{ base: '3xl', md: '5xl' }} fontWeight={800} mb={3}>Architect Partner Programme</Text>
          <Text color="blue.100" fontSize={{ base: 'md', md: 'lg' }} maxW="720px" mx="auto">
            Register your practice and unlock preferential pricing across the entire catalogue.
          </Text>
        </Box>
      </Box>

      <Box maxW="720px" mx="auto" px={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }}>
        <Box bg="white" rounded="2xl" p={{ base: 5, md: 8 }} border="1px solid" borderColor="gray.100" shadow="md">
          <Text fontSize="2xl" fontWeight={800} color="gray.900" mb={2}>Register Your Practice</Text>
          <Text color="gray.500" fontSize="sm" mb={6}>Your account will be reviewed and activated by our team.</Text>

          {error && <Box bg="red.50" border="1px solid" borderColor="red.200" rounded="lg" p={3} mb={4}><Text fontSize="sm" color="red.700">{error}</Text></Box>}

          <Box as="form" onSubmit={submit}>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Firm Name *</Field.Label>
                <Input value={form.firmName} onChange={e => set('firmName', e.target.value)} />
              </Field.Root>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Contact Person *</Field.Label>
                <Input value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} />
              </Field.Root>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Email *</Field.Label>
                <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} />
              </Field.Root>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Password *</Field.Label>
                <Input type="password" value={form.password} onChange={e => set('password', e.target.value)} />
              </Field.Root>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Phone *</Field.Label>
                <Input value={form.phone} onChange={e => set('phone', e.target.value)} />
              </Field.Root>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>License Number *</Field.Label>
                <Input value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} />
              </Field.Root>
              <Field.Root gridColumn={{ md: 'span 2' }}>
                <Field.Label fontSize="sm" fontWeight={600}>City</Field.Label>
                <Input value={form.city} onChange={e => set('city', e.target.value)} />
              </Field.Root>
            </SimpleGrid>
            <Button type="submit" colorPalette="blue" w="full" size="lg" mt={6} rounded="xl" fontWeight={700} loading={loading}>
              Submit Application
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
