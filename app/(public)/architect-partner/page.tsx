'use client';

import {
  Box, Text, Button, HStack, VStack, Flex, SimpleGrid, Input, Field,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toaster } from '@/components/ui/toaster';

export default function ArchitectPartnerPage() {
  return (
    <Suspense>
      <ArchitectPartnerContent />
    </Suspense>
  );
}

function ArchitectPartnerContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantSlug = searchParams.get('tenant') ?? undefined;

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    contactPerson: '', firmName: '', phone: '', email: '', password: '',
    city: '', licenseNumber: '', specialization: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const required = ['contactPerson', 'firmName', 'phone', 'email', 'password', 'city', 'licenseNumber'];

  const validate = () => {
    const e: Record<string, string> = {};
    required.forEach(k => { if (!form[k as keyof typeof form].trim()) e[k] = 'Required'; });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (form.password && form.password.length < 6) e.password = 'Min 6 characters';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/architects/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tenantSlug }),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ submit: data.error ?? 'Registration failed' }); return; }

      setSubmitted(true);
      toaster.create({ title: 'Application Submitted!', description: 'Our team will review and approve your account.', type: 'success', duration: 3000 });

      // Auto-login after registration
      login({ id: data.id, name: data.name, email: data.email, role: data.role, tenantId: data.tenantId, architectId: data.architectId });
    } catch {
      setErrors({ submit: 'Unable to reach server. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string, v: string) => {
    setForm(p => ({ ...p, [k]: v }));
    if (errors[k]) setErrors(p => ({ ...p, [k]: '' }));
  };

  if (submitted) {
    return (
      <Box maxW="600px" mx="auto" px={{ base: 4, md: 6 }} py={16} textAlign="center">
        <Box bg="blue.50" rounded="2xl" p={10} border="1px solid" borderColor="blue.100">
          <Text fontSize="4xl" mb={4}>🎉</Text>
          <Text fontSize="2xl" fontWeight={800} color="gray.900" mb={2}>Application Submitted!</Text>
          <Text color="gray.600" mb={6}>Your architect partner application is under review. We&apos;ll contact you within 2-3 business days.</Text>
          <Box bg="white" rounded="xl" p={4} border="1px solid" borderColor="gray.100" mb={6} textAlign="left">
            <Text fontSize="xs" color="gray.500" fontWeight={600} mb={2}>Application Status</Text>
            <HStack gap={2}>
              <Box w={2} h={2} rounded="full" bg="orange.400" />
              <Text fontWeight={700} color="orange.600">Pending Approval</Text>
            </HStack>
          </Box>
          <Link href="/">
            <Button colorPalette="blue" size="lg" rounded="xl">Back to Home</Button>
          </Link>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Hero */}
      <Box bg="linear-gradient(135deg, #1a365d 0%, #2b6cb0 100%)" color="white" py={{ base: 14, md: 20 }} px={{ base: 4, md: 6 }}>
        <Box maxW="900px" mx="auto" textAlign="center">
          <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight={800} mb={3}>Become an Architect Partner</Text>
          <Text fontSize="lg" color="blue.200" mb={6}>
            Join our exclusive architect program for special pricing, dedicated support, and project resources.
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} maxW="700px" mx="auto">
            {['Exclusive Discounts', 'Priority Support', 'Project Assistance'].map(b => (
              <Box key={b} bg="rgba(255,255,255,0.12)" rounded="xl" px={4} py={3} border="1px solid rgba(255,255,255,0.2)">
                <Text fontWeight={600} fontSize="sm">✓ {b}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* Form */}
      <Box maxW="800px" mx="auto" px={{ base: 4, md: 6 }} py={10}>
        <Box bg="white" rounded="2xl" p={{ base: 4, md: 8 }} border="1px solid" borderColor="gray.100" shadow="sm">
          <Text fontSize="xl" fontWeight={700} color="gray.900" mb={6}>Registration Form</Text>
          {errors.submit && (
            <Box bg="red.50" rounded="lg" p={3} mb={4} border="1px solid" borderColor="red.200">
              <Text fontSize="sm" color="red.600">{errors.submit}</Text>
            </Box>
          )}
          <Box as="form" onSubmit={handleSubmit}>
            <Text fontWeight={600} fontSize="sm" color="gray.600" mb={3} textTransform="uppercase" letterSpacing="wide">Personal Information</Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} mb={5}>
              {[
                { key: 'contactPerson', label: 'Architect Name', ph: 'Amit Desai', req: true },
                { key: 'firmName', label: 'Firm Name', ph: 'Desai Architecture Studio', req: true },
                { key: 'phone', label: 'Mobile Number', ph: '9876543210', req: true },
                { key: 'email', label: 'Email', ph: 'amit@firmname.com', req: true },
                { key: 'city', label: 'City', ph: 'Mumbai', req: true },
                { key: 'licenseNumber', label: 'COA / License No.', ph: 'COA/2018/12345', req: true },
              ].map(f => (
                <Field.Root key={f.key} invalid={!!errors[f.key]}>
                  <Field.Label fontSize="sm" fontWeight={600}>{f.label} {f.req && <Text as="span" color="red.500">*</Text>}</Field.Label>
                  <Input placeholder={f.ph} value={form[f.key as keyof typeof form]} onChange={e => set(f.key, e.target.value)} borderColor={errors[f.key] ? 'red.300' : 'gray.200'} />
                  {errors[f.key] && <Field.ErrorText>{errors[f.key]}</Field.ErrorText>}
                </Field.Root>
              ))}
            </SimpleGrid>

            <Field.Root mb={4} required invalid={!!errors.password}>
              <Field.Label fontSize="sm" fontWeight={600}>Password <Text as="span" color="red.500">*</Text></Field.Label>
              <Input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => set('password', e.target.value)} />
              {errors.password && <Field.ErrorText>{errors.password}</Field.ErrorText>}
            </Field.Root>

            <Field.Root mb={5}>
              <Field.Label fontSize="sm" fontWeight={600}>Project Specialization</Field.Label>
              <Input placeholder="Commercial, Hospitality, Residential..." value={form.specialization} onChange={e => set('specialization', e.target.value)} />
            </Field.Root>

            <Button type="submit" colorPalette="blue" size="lg" w="full" rounded="xl" fontWeight={700} loading={loading} loadingText="Submitting...">
              Submit Application
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
