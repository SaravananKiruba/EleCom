'use client';

import { Box, Text, Flex, VStack, Textarea, Button, HStack } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Activity {
  id: string; type: string; subject?: string; description?: string;
  createdAt: string; user: { name: string };
}

const TYPE_ICONS: Record<string, string> = {
  NOTE: '📝', CALL: '📞', EMAIL: '✉️', WHATSAPP: '💬',
  MEETING: '🤝', STATUS_CHANGE: '🔄', SYSTEM: '⚙️',
};

interface Props {
  customerId?: string;
  quoteId?: string;
  rfqId?: string;
  salesOrderId?: string;
}

export function ActivityTimeline({ customerId, quoteId, rfqId, salesOrderId }: Props) {
  const { user } = useAuth();
  const tenantId = user.tenantId;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchActivities = useCallback(async () => {
    if (!tenantId) return;
    const q = new URLSearchParams({ tenantId });
    if (customerId) q.set('customerId', customerId);
    if (quoteId) q.set('quoteId', quoteId);
    if (rfqId) q.set('rfqId', rfqId);
    const data = await fetch(`/api/activities?${q}`).then(r => r.json());
    setActivities(Array.isArray(data) ? data : []);
  }, [tenantId, customerId, quoteId, rfqId]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const addNote = async () => {
    if (!note.trim() || !tenantId || !user.id) return;
    setSaving(true);
    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, userId: user.id, type: 'NOTE', description: note.trim(), customerId, quoteId, rfqId, salesOrderId }),
      });
      setNote('');
      fetchActivities();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Text fontSize="sm" fontWeight={700} color="gray.700" mb={3}>Activity Timeline</Text>

      {/* Add note */}
      <Box mb={4}>
        <Textarea
          value={note} onChange={e => setNote(e.target.value)}
          placeholder="Add a note..." rows={2} fontSize="sm"
          mb={2}
        />
        <Button size="xs" colorPalette="blue" onClick={addNote} loading={saving} disabled={!note.trim()}>
          Add Note
        </Button>
      </Box>

      {activities.length === 0 ? (
        <Text fontSize="sm" color="gray.400" textAlign="center" py={4}>No activity yet</Text>
      ) : (
        <VStack gap={0} align="stretch">
          {activities.map((a, i) => (
            <Flex key={a.id} gap={3} pb={3} position="relative">
              {/* Vertical line */}
              {i < activities.length - 1 && (
                <Box position="absolute" left="15px" top="28px" bottom={0} w="2px" bg="gray.100" />
              )}
              <Box
                w="30px" h="30px" rounded="full" bg="gray.100"
                display="flex" alignItems="center" justifyContent="center"
                fontSize="sm" flexShrink={0} zIndex={1}
              >
                {TYPE_ICONS[a.type] ?? '•'}
              </Box>
              <Box flex={1} pt="4px">
                <HStack gap={2} mb={0.5}>
                  <Text fontSize="xs" fontWeight={600} color="gray.700">{a.user.name}</Text>
                  <Text fontSize="xs" color="gray.400">
                    {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Text>
                </HStack>
                {a.subject && <Text fontSize="xs" fontWeight={600} color="gray.600">{a.subject}</Text>}
                {a.description && <Text fontSize="xs" color="gray.600" lineHeight={1.5}>{a.description}</Text>}
              </Box>
            </Flex>
          ))}
        </VStack>
      )}
    </Box>
  );
}
