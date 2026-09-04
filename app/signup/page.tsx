'use client';

import { Box, Text, Button, VStack, HStack, Input, Field } from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface SignupForm {
  companyName: string;
  contactPerson: string;
  email: string;
  password: string;
  phone: string;
  gstNumber: string;
  city: string;
}

const EMPTY: SignupForm = { companyName: '', contactPerson: '', email: '', password: '', phone: '', gstNumber: '', city: '' };


export default function SignupPage() {
  return (
    <Suspense>
      <SignupContent />
    </Suspense>
  );
}

function SignupContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get('tenant') ?? undefined;

  const [form, setForm] = useState<SignupForm>(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof SignupForm, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError('');
    if (!form.companyName.trim() || !form.contactPerson.trim() || !form.email.trim() || !form.password || !form.phone.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tenantSlug }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Registration failed'); return; }

      login({ id: data.id, name: data.name, email: data.email, role: data.role, tenantId: data.tenantId, tenantName: data.tenantName, customerId: data.customerId });
      const returnTo = typeof window !== 'undefined' ? (sessionStorage.getItem('crmboo_return_after_signup') ?? '/dashboard') : '/dashboard';
      sessionStorage.removeItem('crmboo_return_after_signup');
      router.push(returnTo);
    } catch {
      setError('Unable to reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" px={4} py={10}>
      <Box w="full" maxW="480px">
        <Box textAlign="center" mb={8}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Box display="flex" justifyContent="center" mb={4}>
              <Image src="/crmboo-logo.png" alt="CRMBoo" width={80} height={80} priority style={{ borderRadius: 14 }} />
            </Box>
          </Link>
          <Text fontSize="2xl" fontWeight={700} color="gray.900">Create Account</Text>
          <Text fontSize="sm" color="gray.500" mt={1}>Sign up to browse products and submit quote requests</Text>
        </Box>

        <Box bg="white" rounded="2xl" p={6} border="1px solid" borderColor="gray.100" shadow="sm">
          {error && (
            <Box bg="red.50" rounded="lg" p={3} mb={4} border="1px solid" borderColor="red.200">
              <Text fontSize="sm" color="red.600">{error}</Text>
            </Box>
          )}

          <VStack gap={4} align="stretch">
            <Field.Root required>
              <Field.Label fontSize="sm" fontWeight={600}>Company Name <Field.RequiredIndicator /></Field.Label>
              <Input placeholder="e.g. Sharma Constructions Pvt. Ltd." value={form.companyName} onChange={e => set('companyName', e.target.value)} />
            </Field.Root>

            <Field.Root required>
              <Field.Label fontSize="sm" fontWeight={600}>Contact Person <Field.RequiredIndicator /></Field.Label>
              <Input placeholder="Your full name" value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} />
            </Field.Root>

            <HStack gap={3}>
              <Field.Root required flex={1}>
                <Field.Label fontSize="sm" fontWeight={600}>Email <Field.RequiredIndicator /></Field.Label>
                <Input type="email" placeholder="you@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </Field.Root>
              <Field.Root required flex={1}>
                <Field.Label fontSize="sm" fontWeight={600}>Phone <Field.RequiredIndicator /></Field.Label>
                <Input placeholder="10-digit number" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </Field.Root>
            </HStack>

            <Field.Root required>
              <Field.Label fontSize="sm" fontWeight={600}>Password <Field.RequiredIndicator /></Field.Label>
              <Input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
            </Field.Root>

            <HStack gap={3}>
              <Field.Root flex={1}>
                <Field.Label fontSize="sm" fontWeight={600}>City</Field.Label>
                <Input placeholder="City" value={form.city} onChange={e => set('city', e.target.value)} />
              </Field.Root>
              <Field.Root flex={1}>
                <Field.Label fontSize="sm" fontWeight={600}>GST Number</Field.Label>
                <Input placeholder="Optional" value={form.gstNumber} onChange={e => set('gstNumber', e.target.value)} />
              </Field.Root>
            </HStack>

            <Button colorPalette="green" size="lg" onClick={handleSubmit} mt={2} loading={loading} loadingText="Creating account...">
              Create Account
            </Button>

            <Text fontSize="xs" color="gray.500" textAlign="center">
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#6b8375', fontWeight: 600 }}>Sign In</Link>
            </Text>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
