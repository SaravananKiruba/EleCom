'use client';

import {
  Box, Text, Button, VStack, HStack, Input, Field, Flex, Steps,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAppState } from '@/context/AppContext';
import { Customer } from '@/types';

interface FormData {
  companyName: string;
  contactPerson: string;
  email: string;
  mobile: string;
  gst: string;
  address: string;
  city: string;
  state: string;
}

const EMPTY: FormData = {
  companyName: '', contactPerson: '', email: '', mobile: '',
  gst: '', address: '', city: '', state: '',
};

// Customer signups default to the first active tenant (CVS Lighting demo)
const DEFAULT_TENANT_ID = 'tenant-1';

export default function SignupPage() {
  const { login } = useAuth();
  const { dispatch } = useAppState();
  const router = useRouter();
  const [form, setForm] = useState<FormData>(EMPTY);
  const [error, setError] = useState('');

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.companyName.trim() || !form.contactPerson.trim() || !form.email.trim() || !form.mobile.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    const customerId = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      tenantId: DEFAULT_TENANT_ID,
      id: customerId,
      name: form.contactPerson.trim(),
      companyName: form.companyName.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      gst: form.gst.trim(),
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    dispatch({ type: 'ADD_CUSTOMER', payload: newCustomer });
    login({
      role: 'customer',
      name: form.contactPerson.trim(),
      email: form.email.trim(),
      tenantId: DEFAULT_TENANT_ID,
      customerId,
    });

    // Redirect back to quote-cart if they came from there, otherwise dashboard
    const returnTo = typeof window !== 'undefined'
      ? (sessionStorage.getItem('crmboo_return_after_signup') ?? '/dashboard')
      : '/dashboard';
    sessionStorage.removeItem('crmboo_return_after_signup');
    router.push(returnTo);
  };

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" px={4} py={10}>
      <Box w="full" maxW="480px">
        <Box textAlign="center" mb={8}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <HStack gap={2} justify="center" mb={4}>
              <Box bg="green.600" color="white" rounded="xl" w={10} h={10} display="flex" alignItems="center" justifyContent="center" fontSize="lg" fontWeight={700}>💡</Box>
              <Text fontWeight={800} fontSize="xl" color="gray.900">CRMBoo</Text>
            </HStack>
          </Link>
          <Text fontSize="2xl" fontWeight={700} color="gray.900">Create Your Account</Text>
          <Text fontSize="sm" color="gray.500" mt={1}>Set up your company account to submit quotes</Text>
        </Box>

        <Box bg="white" rounded="2xl" p={6} border="1px solid" borderColor="gray.100" shadow="sm">
          {error && (
            <Box bg="red.50" rounded="lg" p={3} mb={4} border="1px solid" borderColor="red.200">
              <Text fontSize="sm" color="red.600">{error}</Text>
            </Box>
          )}

          <VStack gap={4} align="stretch">
            <Text fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide">Company Details</Text>

            <Field.Root required>
              <Field.Label fontSize="sm" fontWeight={500}>Company Name <Field.RequiredIndicator /></Field.Label>
              <Input size="sm" placeholder="e.g. Sharma Constructions Pvt. Ltd." value={form.companyName} onChange={e => set('companyName', e.target.value)} />
            </Field.Root>

            <Field.Root required>
              <Field.Label fontSize="sm" fontWeight={500}>Contact Person <Field.RequiredIndicator /></Field.Label>
              <Input size="sm" placeholder="Your full name" value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)} />
            </Field.Root>

            <HStack gap={3}>
              <Field.Root required flex={1}>
                <Field.Label fontSize="sm" fontWeight={500}>Email <Field.RequiredIndicator /></Field.Label>
                <Input size="sm" type="email" placeholder="you@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
              </Field.Root>
              <Field.Root required flex={1}>
                <Field.Label fontSize="sm" fontWeight={500}>Mobile <Field.RequiredIndicator /></Field.Label>
                <Input size="sm" placeholder="10-digit number" value={form.mobile} onChange={e => set('mobile', e.target.value)} />
              </Field.Root>
            </HStack>

            <Field.Root>
              <Field.Label fontSize="sm" fontWeight={500}>GST Number</Field.Label>
              <Input size="sm" placeholder="Optional" value={form.gst} onChange={e => set('gst', e.target.value)} />
            </Field.Root>

            <Field.Root>
              <Field.Label fontSize="sm" fontWeight={500}>Address</Field.Label>
              <Input size="sm" placeholder="Office / delivery address" value={form.address} onChange={e => set('address', e.target.value)} />
            </Field.Root>

            <HStack gap={3}>
              <Field.Root flex={1}>
                <Field.Label fontSize="sm" fontWeight={500}>City</Field.Label>
                <Input size="sm" placeholder="City" value={form.city} onChange={e => set('city', e.target.value)} />
              </Field.Root>
              <Field.Root flex={1}>
                <Field.Label fontSize="sm" fontWeight={500}>State</Field.Label>
                <Input size="sm" placeholder="State" value={form.state} onChange={e => set('state', e.target.value)} />
              </Field.Root>
            </HStack>

            <Button colorPalette="green" size="md" onClick={handleSubmit} mt={2}>
              Create Account & Continue
            </Button>

            <Text fontSize="xs" color="gray.500" textAlign="center">
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#3182ce', fontWeight: 600 }}>Sign In</Link>
            </Text>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
