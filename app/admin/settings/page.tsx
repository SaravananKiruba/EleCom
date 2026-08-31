'use client';

import {
  Box, Text, VStack, HStack, Button, Input, Field, Separator, SimpleGrid, Badge,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { toaster } from '@/components/ui/toaster';

interface StoreInfo {
  id: string; slug: string; name: string; tagline: string;
  logoUrl: string | null; primaryColor: string; bannerText: string | null; primaryDomain: string | null;
}

interface Domain { id: string; domain: string; isPrimary: boolean; verifiedAt: string | null; }

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const tenantId = user.tenantId;
  const tenantSlug = user.tenantSlug;

  const [store, setStore] = useState<StoreInfo | null>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [tagline, setTagline] = useState('');
  const [color, setColor] = useState('#6b8375');
  const [bannerText, setBannerText] = useState('');
  const [saving, setSaving] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [addingDomain, setAddingDomain] = useState(false);

  useEffect(() => {
    if (!tenantSlug) return;
    fetch(`/api/store/${tenantSlug}`).then(r => r.ok ? r.json() : null).then(data => {
      if (data) {
        setStore(data);
        setTagline(data.tagline ?? '');
        setColor(data.primaryColor ?? '#6b8375');
        setBannerText(data.bannerText ?? '');
      }
    });
    if (tenantId) {
      fetch(`/api/store/domains?tenantId=${tenantId}`).then(r => r.ok ? r.json() : []).then(setDomains);
    }
  }, [tenantSlug, tenantId]);

  const saveSettings = async () => {
    if (!tenantId) return;
    setSaving(true);
    try {
      await fetch('/api/store/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, tagline, primaryColor: color, bannerText }),
      });
      toaster.create({ title: 'Settings saved', type: 'success', duration: 2000 });
    } finally {
      setSaving(false);
    }
  };

  const addDomain = async () => {
    if (!newDomain.trim() || !tenantId) return;
    setAddingDomain(true);
    try {
      const res = await fetch('/api/store/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, domain: newDomain.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) { toaster.create({ title: data.error ?? 'Failed', type: 'error', duration: 3000 }); return; }
      setDomains(prev => [...prev, data]);
      setNewDomain('');
      toaster.create({ title: 'Domain added', type: 'success', duration: 2000 });
    } finally {
      setAddingDomain(false);
    }
  };

  const removeDomain = async (id: string) => {
    await fetch(`/api/store/domains/${id}`, { method: 'DELETE' });
    setDomains(prev => prev.filter(d => d.id !== id));
    toaster.create({ title: 'Domain removed', type: 'info', duration: 2000 });
  };

  const storeUrl = tenantSlug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/store/${tenantSlug}` : '';

  return (
    <Box>
      <PageHeader title="Store Settings" subtitle="Configure your ecommerce storefront" />

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        {/* Branding */}
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" p={6}>
          <Text fontWeight={700} fontSize="md" color="gray.800" mb={4}>Branding</Text>
          <VStack align="stretch" gap={4}>
            <Field.Root>
              <Field.Label fontSize="sm" fontWeight={600}>Store Tagline</Field.Label>
              <Input placeholder="Quality lighting solutions for every project" value={tagline} onChange={e => setTagline(e.target.value)} />
            </Field.Root>
            <Field.Root>
              <Field.Label fontSize="sm" fontWeight={600}>Banner Text</Field.Label>
              <Input placeholder="Free delivery on orders above Rs. 50,000" value={bannerText} onChange={e => setBannerText(e.target.value)} />
            </Field.Root>
            <Field.Root>
              <Field.Label fontSize="sm" fontWeight={600}>Primary Color</Field.Label>
              <HStack gap={3}>
                <Input type="color" value={color} onChange={e => setColor(e.target.value)} w="60px" p={1} h="40px" />
                <Input value={color} onChange={e => setColor(e.target.value)} placeholder="#6b8375" />
              </HStack>
            </Field.Root>
            <Button colorPalette="green" onClick={saveSettings} loading={saving} loadingText="Saving...">
              Save Settings
            </Button>
          </VStack>
        </Box>

        {/* Store URL + Custom Domain */}
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" p={6}>
          <Text fontWeight={700} fontSize="md" color="gray.800" mb={4}>Store URL & Custom Domain</Text>

          <Box bg="gray.50" rounded="lg" p={4} mb={5} border="1px solid" borderColor="gray.200">
            <Text fontSize="xs" color="gray.500" mb={1}>Default Store URL</Text>
            <Text fontSize="sm" fontWeight={600} color="blue.600" wordBreak="break-all">{storeUrl}</Text>
            <Button size="xs" variant="ghost" colorPalette="blue" mt={2}
              onClick={() => { navigator.clipboard.writeText(storeUrl); toaster.create({ title: 'Copied!', type: 'success', duration: 1500 }); }}>
              Copy Link
            </Button>
          </Box>

          <Text fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" mb={3}>Custom Domains</Text>

          {domains.map(d => (
            <HStack key={d.id} bg="gray.50" rounded="lg" p={3} mb={2} justify="space-between">
              <Box>
                <Text fontSize="sm" fontWeight={600}>{d.domain}</Text>
                <HStack gap={2} mt={0.5}>
                  {d.isPrimary && <Badge colorPalette="blue" size="xs">Primary</Badge>}
                  {d.verifiedAt
                    ? <Badge colorPalette="green" size="xs">Verified</Badge>
                    : <Badge colorPalette="orange" size="xs">Pending DNS</Badge>
                  }
                </HStack>
              </Box>
              <Button size="xs" colorPalette="red" variant="ghost" onClick={() => removeDomain(d.id)}>Remove</Button>
            </HStack>
          ))}

          <HStack gap={2} mt={3}>
            <Input
              placeholder="shop.yourcompany.com"
              value={newDomain}
              onChange={e => setNewDomain(e.target.value)}
              size="sm"
            />
            <Button size="sm" colorPalette="blue" onClick={addDomain} loading={addingDomain} flexShrink={0}>
              Add
            </Button>
          </HStack>

          {domains.length > 0 && (
            <Box bg="blue.50" rounded="lg" p={4} mt={4} border="1px solid" borderColor="blue.100">
              <Text fontSize="xs" fontWeight={700} color="blue.700" mb={2}>DNS Setup Instructions</Text>
              <Text fontSize="xs" color="blue.600">Add a CNAME record pointing to:</Text>
              <Text fontSize="xs" fontFamily="mono" color="blue.800" fontWeight={700} mt={1}>
                cname.crmboo.io
              </Text>
              <Text fontSize="xs" color="blue.500" mt={2}>Allow 24-48 hours for DNS propagation.</Text>
            </Box>
          )}
        </Box>
      </SimpleGrid>
    </Box>
  );
}
