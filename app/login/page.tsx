'use client';

import {
  Box, Text, Button, VStack, HStack, Input, Field, Separator, Flex,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, AuthUser } from '@/context/AuthContext';
import { architects } from '@/data/mockData';

type Tab = 'customer' | 'architect' | 'admin';

const ADMIN_PASS = 'admin123';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleCustomer = () => {
    if (!name.trim()) { setError('Please enter your name'); return; }
    const user: AuthUser = { role: 'customer', name: name.trim(), email: email.trim() || undefined };
    login(user);
    router.push('/dashboard');
  };

  const handleArchitect = () => {
    if (!email.trim()) { setError('Please enter your registered email'); return; }
    const arch = architects.find(a => a.email.toLowerCase() === email.toLowerCase().trim());
    if (!arch) { setError('Email not found. Please register first.'); return; }
    if (!['Active', 'Approved'].includes(arch.status)) {
      setError(`Your account is ${arch.status}. Please wait for admin approval.`); return;
    }
    const user: AuthUser = { role: 'architect', name: arch.name, email: arch.email, architectId: arch.id, discount: arch.discount };
    login(user);
    router.push('/catalogue');
  };

  const handleAdmin = () => {
    if (password !== ADMIN_PASS) { setError('Incorrect password'); return; }
    const user: AuthUser = { role: 'admin', name: 'Admin' };
    login(user);
    router.push('/admin');
  };

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'customer', label: 'Customer', icon: '👤' },
    { id: 'architect', label: 'Architect', icon: '🏛️' },
    { id: 'admin', label: 'Admin', icon: '⚡' },
  ];

  return (
    <Box minH="100vh" bg="gray.50" display="flex" alignItems="center" justifyContent="center" px={4}>
      <Box w="full" maxW="420px">
        <Box textAlign="center" mb={8}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <HStack gap={2} justify="center" mb={4}>
              <Box bg="blue.600" color="white" rounded="xl" w={10} h={10} display="flex" alignItems="center" justifyContent="center" fontSize="lg" fontWeight={700}>💡</Box>
              <Text fontWeight={800} fontSize="xl" color="gray.900">EleCom <Text as="span" color="blue.600">Lighting</Text></Text>
            </HStack>
          </Link>
          <Text fontSize="2xl" fontWeight={700} color="gray.900">Sign In</Text>
          <Text fontSize="sm" color="gray.500" mt={1}>Choose your account type</Text>
        </Box>

        <Box bg="white" rounded="2xl" p={6} border="1px solid" borderColor="gray.100" shadow="sm">
          {/* Tab switcher */}
          <HStack gap={1} bg="gray.100" rounded="lg" p={1} mb={6}>
            {TABS.map(t => (
              <Box
                key={t.id}
                flex={1}
                textAlign="center"
                py={2}
                rounded="md"
                cursor="pointer"
                bg={tab === t.id ? 'white' : 'transparent'}
                shadow={tab === t.id ? 'sm' : 'none'}
                transition="all 0.15s"
                onClick={() => { setTab(t.id); setError(''); }}
              >
                <Text fontSize="xs" fontWeight={700} color={tab === t.id ? 'blue.700' : 'gray.500'}>{t.icon} {t.label}</Text>
              </Box>
            ))}
          </HStack>

          {error && (
            <Box bg="red.50" rounded="lg" p={3} mb={4} border="1px solid" borderColor="red.200">
              <Text fontSize="sm" color="red.600">{error}</Text>
            </Box>
          )}

          {tab === 'customer' && (
            <VStack gap={4} align="stretch">
              <Box bg="blue.50" rounded="lg" p={3} border="1px solid" borderColor="blue.100">
                <Text fontSize="xs" color="blue.700" fontWeight={600}>Browse products, add to cart, and submit quote requests</Text>
              </Box>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Your Name</Field.Label>
                <Input placeholder="e.g. Rajesh Kumar" value={name} onChange={e => setName(e.target.value)} />
              </Field.Root>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Email (optional)</Field.Label>
                <Input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </Field.Root>
              <Button colorPalette="blue" onClick={handleCustomer} w="full" size="lg" rounded="xl">
                Continue as Customer
              </Button>
            </VStack>
          )}

          {tab === 'architect' && (
            <VStack gap={4} align="stretch">
              <Box bg="blue.50" rounded="lg" p={3} border="1px solid" borderColor="blue.100">
                <Text fontSize="xs" color="blue.700" fontWeight={600}>View prices with your exclusive architect discount. Requires admin approval.</Text>
              </Box>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Registered Email</Field.Label>
                <Input type="email" placeholder="your.firm@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </Field.Root>
              <Button colorPalette="blue" onClick={handleArchitect} w="full" size="lg" rounded="xl">
                Sign In as Architect
              </Button>
              <Link href="/architect-partner" style={{ textDecoration: 'none' }}>
                <Text fontSize="sm" color="blue.600" textAlign="center" _hover={{ textDecoration: 'underline' }}>
                  Not registered? Apply here →
                </Text>
              </Link>
            </VStack>
          )}

          {tab === 'admin' && (
            <VStack gap={4} align="stretch">
              <Box bg="gray.50" rounded="lg" p={3} border="1px solid" borderColor="gray.200">
                <Text fontSize="xs" color="gray.600" fontWeight={600}>Admin access only. Demo password: admin123</Text>
              </Box>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Admin Password</Field.Label>
                <Input type="password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdmin()} />
              </Field.Root>
              <Button colorPalette="blue" onClick={handleAdmin} w="full" size="lg" rounded="xl">
                Sign In as Admin
              </Button>
            </VStack>
          )}
        </Box>

        <Text fontSize="xs" color="gray.400" textAlign="center" mt={6}>
          Demo app — no real authentication
        </Text>
      </Box>
    </Box>
  );
}
