'use client';

import { Box, Text, Button, VStack, HStack, Input, Field, SimpleGrid, Separator } from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface JoinForm {
  companyName: string; legalName: string; email: string; phone: string;
  gstNumber: string; industry: string;
  adminName: string; adminEmail: string; adminPassword: string;
}

const EMPTY: JoinForm = {
  companyName: '', legalName: '', email: '', phone: '', gstNumber: '', industry: '',
  adminName: '', adminEmail: '', adminPassword: '',
};

export default function JoinPage() {
  const router = useRouter();
  const [form, setForm] = useState<JoinForm>(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof JoinForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError('');
    if (!form.companyName || !form.email || !form.adminName || !form.adminEmail || !form.adminPassword) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.adminPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Registration failed'); return; }
      setDone(true);
    } catch {
      setError('Unable to reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" px={4}>
        <Box w="full" maxW="480px" textAlign="center">
          <Box bg="white" rounded="2xl" p={10} border="1px solid" borderColor="gray.100" shadow="sm">
            <Text fontSize="4xl" mb={4}>🎉</Text>
            <Text fontSize="2xl" fontWeight={800} color="gray.900" mb={2}>Application Submitted!</Text>
            <Text color="gray.500" mb={4}>
              Your company has been registered. The platform admin will review and approve your account.
              You will be able to log in once approved.
            </Text>
            <Box bg="orange.50" rounded="xl" p={4} border="1px solid" borderColor="orange.200" mb={6} textAlign="left">
              <Text fontSize="sm" fontWeight={700} color="orange.700" mb={1}>What happens next?</Text>
              <VStack align="start" gap={1}>
                <Text fontSize="sm" color="orange.600">1. SaaS admin reviews your application</Text>
                <Text fontSize="sm" color="orange.600">2. Account activated — you get CRM + ecommerce</Text>
                <Text fontSize="sm" color="orange.600">3. Log in and set up your store</Text>
              </VStack>
            </Box>
            <Link href="/login">
              <Button colorPalette="green" size="lg" w="full">Go to Login</Button>
            </Link>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50" py={10} px={4}>
      <Box w="full" maxW="640px" mx="auto">
        <Box textAlign="center" mb={8}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Box display="flex" justifyContent="center" mb={4}>
              <Image src="/crmboo-logo.png" alt="CRMBoo" width={80} height={80} priority style={{ borderRadius: 14 }} />
            </Box>
          </Link>
          <Text fontSize="3xl" fontWeight={800} color="gray.900">Register Your Business</Text>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Get your own CRM + ecommerce storefront. Free trial — no credit card needed.
          </Text>
        </Box>

        <Box bg="white" rounded="2xl" p={{ base: 5, md: 8 }} border="1px solid" borderColor="gray.100" shadow="sm">
          {error && (
            <Box bg="red.50" rounded="lg" p={3} mb={5} border="1px solid" borderColor="red.200">
              <Text fontSize="sm" color="red.600">{error}</Text>
            </Box>
          )}

          <Text fontSize="xs" fontWeight={700} color="gray.400" textTransform="uppercase" letterSpacing="wide" mb={4}>Company Details</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={6}>
            <Field.Root required>
              <Field.Label fontSize="sm" fontWeight={600}>Company Name <Field.RequiredIndicator /></Field.Label>
              <Input placeholder="CVS Lighting Pvt. Ltd." value={form.companyName} onChange={e => set('companyName', e.target.value)} />
            </Field.Root>
            <Field.Root>
              <Field.Label fontSize="sm" fontWeight={600}>Legal Name</Field.Label>
              <Input placeholder="Same as company or full legal name" value={form.legalName} onChange={e => set('legalName', e.target.value)} />
            </Field.Root>
            <Field.Root required>
              <Field.Label fontSize="sm" fontWeight={600}>Business Email <Field.RequiredIndicator /></Field.Label>
              <Input type="email" placeholder="info@yourcompany.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </Field.Root>
            <Field.Root>
              <Field.Label fontSize="sm" fontWeight={600}>Phone</Field.Label>
              <Input placeholder="10-digit number" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </Field.Root>
            <Field.Root>
              <Field.Label fontSize="sm" fontWeight={600}>GST Number</Field.Label>
              <Input placeholder="27AABCC1234A1Z5" value={form.gstNumber} onChange={e => set('gstNumber', e.target.value)} />
            </Field.Root>
            <Field.Root>
              <Field.Label fontSize="sm" fontWeight={600}>Industry</Field.Label>
              <Input placeholder="Lighting, Electrical, etc." value={form.industry} onChange={e => set('industry', e.target.value)} />
            </Field.Root>
          </SimpleGrid>

          <Separator mb={6} />

          <Text fontSize="xs" fontWeight={700} color="gray.400" textTransform="uppercase" letterSpacing="wide" mb={4}>Admin Account (your login)</Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={6}>
            <Field.Root required>
              <Field.Label fontSize="sm" fontWeight={600}>Your Name <Field.RequiredIndicator /></Field.Label>
              <Input placeholder="Arjun Mehta" value={form.adminName} onChange={e => set('adminName', e.target.value)} />
            </Field.Root>
            <Field.Root required>
              <Field.Label fontSize="sm" fontWeight={600}>Admin Email <Field.RequiredIndicator /></Field.Label>
              <Input type="email" placeholder="you@yourcompany.com" value={form.adminEmail} onChange={e => set('adminEmail', e.target.value)} />
            </Field.Root>
            <Field.Root required>
              <Field.Label fontSize="sm" fontWeight={600}>Password <Field.RequiredIndicator /></Field.Label>
              <Input type="password" placeholder="Min 6 characters" value={form.adminPassword} onChange={e => set('adminPassword', e.target.value)} />
            </Field.Root>
          </SimpleGrid>

          <Button colorPalette="green" size="lg" w="full" onClick={handleSubmit} loading={loading} loadingText="Submitting...">
            Submit Registration
          </Button>

          <Text fontSize="xs" color="gray.400" textAlign="center" mt={4}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#6b8375', fontWeight: 600 }}>Sign In</Link>
          </Text>
        </Box>

        <HStack gap={6} justify="center" mt={6}>
          {['CRM + Ecommerce', 'Custom Domain', 'Quote Management', 'Customer Portal'].map(f => (
            <Text key={f} fontSize="xs" color="gray.400">✓ {f}</Text>
          ))}
        </HStack>
      </Box>
    </Box>
  );
}
