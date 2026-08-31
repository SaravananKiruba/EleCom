'use client';

import {
  Box, Text, Button, HStack, Flex, Badge, Input, Field, VStack,
  DialogRoot, DialogBackdrop, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogCloseTrigger,
} from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { toaster } from '@/components/ui/toaster';

interface TeamUser {
  id: string; name: string; email: string; role: string;
  status: string; lastLoginAt: string | null; createdAt: string;
}

const ROLE_COLORS: Record<string, string> = { TENANT_ADMIN: 'purple', SALES: 'blue' };

export default function AdminTeamPage() {
  const { user } = useAuth();
  const tenantId = user.tenantId;

  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'SALES' });

  const fetchUsers = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    const data = await fetch(`/api/users?tenantId=${tenantId}`).then(r => r.json()).finally(() => setLoading(false));
    setUsers(Array.isArray(data) ? data : []);
  }, [tenantId]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleInvite = async () => {
    if (!tenantId || !form.name || !form.email || !form.password) {
      toaster.create({ title: 'All fields are required', type: 'error', duration: 3000 }); return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed');
      toaster.create({ title: `${data.name} added to team`, type: 'success', duration: 2500 });
      setInviteOpen(false);
      setForm({ name: '', email: '', password: '', role: 'SALES' });
      fetchUsers();
    } catch (err) {
      toaster.create({ title: (err as Error).message, type: 'error', duration: 4000 });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (u: TeamUser) => {
    if (u.id === user.id) { toaster.create({ title: 'Cannot deactivate yourself', type: 'error', duration: 2500 }); return; }
    const nextStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    await fetch(`/api/users/${u.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, status: nextStatus }),
    });
    fetchUsers();
  };

  return (
    <Box p={{ base: 4, md: 6 }}>
      <PageHeader
        title="Team"
        subtitle={`${users.length} members`}
        actions={<Button colorPalette="blue" size="sm" onClick={() => setInviteOpen(true)}>+ Add Member</Button>}
      />

      {loading ? (
        <Box py={10} textAlign="center"><Text color="gray.400">Loading...</Text></Box>
      ) : users.length === 0 ? (
        <EmptyState icon="👥" title="No team members" action={<Button size="sm" colorPalette="blue" onClick={() => setInviteOpen(true)}>Add First Member</Button>} />
      ) : (
        <Box bg="white" rounded="xl" border="1px solid" borderColor="gray.100" shadow="sm" overflow="hidden">
          <Box overflowX="auto">
            <Box as="table" w="full" style={{ borderCollapse: 'collapse', minWidth: '600px' }}>
              <Box as="thead" bg="gray.50" borderBottom="1px solid" borderColor="gray.100">
                <Box as="tr">
                  {['Name', 'Email', 'Role', 'Last Login', 'Status', 'Actions'].map(h => (
                    <Box key={h} as="th" px={4} py={3} textAlign="left" fontSize="xs" fontWeight={700} color="gray.500" textTransform="uppercase" letterSpacing="wide">{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box as="tbody">
                {users.map(u => (
                  <Box as="tr" key={u.id} borderTop="1px solid" borderColor="gray.50" _hover={{ bg: 'gray.50' }}>
                    <Box as="td" px={4} py={3}>
                      <Text fontSize="sm" fontWeight={600} color="gray.800">{u.name}</Text>
                      {u.id === user.id && <Text fontSize="xs" color="blue.500">You</Text>}
                    </Box>
                    <Box as="td" px={4} py={3}><Text fontSize="sm" color="gray.600">{u.email}</Text></Box>
                    <Box as="td" px={4} py={3}>
                      <Badge colorPalette={ROLE_COLORS[u.role] ?? 'gray'} variant="subtle" size="sm">{u.role.replace('_', ' ')}</Badge>
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <Text fontSize="xs" color="gray.500">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('en-IN') : 'Never'}
                      </Text>
                    </Box>
                    <Box as="td" px={4} py={3}>
                      <Badge colorPalette={u.status === 'ACTIVE' ? 'green' : 'gray'} variant="subtle" size="sm">{u.status}</Badge>
                    </Box>
                    <Box as="td" px={4} py={3}>
                      {u.id !== user.id && (
                        <Button size="xs" variant="ghost" colorPalette={u.status === 'ACTIVE' ? 'orange' : 'green'} onClick={() => toggleStatus(u)}>
                          {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Add Member Dialog */}
      <DialogRoot open={inviteOpen} onOpenChange={d => setInviteOpen(d.open)}>
        <DialogBackdrop />
        <DialogContent maxW={{ base: '95vw', md: '440px' }} mx="auto">
          <DialogHeader><Text fontWeight={700}>Add Team Member</Text><DialogCloseTrigger /></DialogHeader>
          <DialogBody>
            <VStack gap={4} align="stretch">
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Full Name</Field.Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ravi Kumar" />
              </Field.Root>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Email</Field.Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ravi@company.com" />
              </Field.Root>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Temporary Password</Field.Label>
                <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 8 characters" />
              </Field.Root>
              <Field.Root>
                <Field.Label fontSize="sm" fontWeight={600}>Role</Field.Label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '14px', color: '#374151', width: '100%' }}>
                  <option value="SALES">Sales</option>
                  <option value="TENANT_ADMIN">Admin</option>
                </select>
              </Field.Root>
            </VStack>
          </DialogBody>
          <DialogFooter gap={3}>
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button colorPalette="blue" onClick={handleInvite} loading={saving}>Add Member</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Box>
  );
}
