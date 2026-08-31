'use client';

import { Box, Text, Button, VStack, Input, Field, HStack } from '@chakra-ui/react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password) { setError('Email and password are required'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Login failed'); return; }
      login({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        tenantId: data.tenantId,
        tenantName: data.tenantName,
        tenantSlug: data.tenantSlug,
      });
      router.push(data.redirect);
    } catch {
      setError('Unable to reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" px={4}>
      <Box w="full" maxW="400px">
        <Box textAlign="center" mb={8}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <HStack gap={2} justify="center" mb={4}>
              <Box bg="green.600" color="white" rounded="xl" w={10} h={10} display="flex" alignItems="center" justifyContent="center" fontSize="lg" fontWeight={700}>C</Box>
              <Text fontWeight={800} fontSize="xl" color="gray.900">CRMBoo</Text>
            </HStack>
          </Link>
          <Text fontSize="2xl" fontWeight={700} color="gray.900">Sign In</Text>
          <Text fontSize="sm" color="gray.500" mt={1}>Enter your credentials to continue</Text>
        </Box>

        <Box bg="white" rounded="2xl" p={6} border="1px solid" borderColor="gray.100" shadow="sm">
          {error && (
            <Box bg="red.50" rounded="lg" p={3} mb={4} border="1px solid" borderColor="red.200">
              <Text fontSize="sm" color="red.600">{error}</Text>
            </Box>
          )}
          <VStack gap={4} align="stretch">
            <Field.Root>
              <Field.Label fontSize="sm" fontWeight={600}>Email</Field.Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                autoFocus
              />
            </Field.Root>
            <Field.Root>
              <Field.Label fontSize="sm" fontWeight={600}>Password</Field.Label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </Field.Root>
            <Button
              colorPalette="green"
              onClick={handleSubmit}
              w="full"
              size="lg"
              rounded="xl"
              loading={loading}
              loadingText="Signing in..."
            >
              Sign In
            </Button>
          </VStack>
        </Box>

        <VStack gap={2} mt={4}>
          <Text fontSize="sm" color="gray.500">
            New customer?{' '}
            <Link href="/signup" style={{ color: '#6b8375', fontWeight: 600 }}>Create account</Link>
          </Text>
          <Text fontSize="sm" color="gray.500">
            Architect partner?{' '}
            <Link href="/architect-partner" style={{ color: '#6b8375', fontWeight: 600 }}>Register here</Link>
          </Text>
        </VStack>
      </Box>
    </Box>
  );
}
