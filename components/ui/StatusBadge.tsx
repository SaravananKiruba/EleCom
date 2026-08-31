'use client';

import { Badge } from '@chakra-ui/react';
import { formatEnum } from '@/utils/format';

const colorMap: Record<string, string> = {
  // RFQ / Quote / Order status
  NEW: 'blue',
  UNDER_REVIEW: 'orange',
  QUOTE_READY: 'purple',
  FOLLOW_UP: 'yellow',
  ACCEPTED: 'green',
  REJECTED: 'red',
  EXPIRED: 'gray',
  DRAFT: 'gray',
  SHARED: 'blue',
  NEGOTIATION: 'purple',
  CONVERTED_TO_SO: 'teal',
  DISPATCHED: 'blue',
  DELIVERED: 'teal',
  CANCELLED: 'gray',
  // Follow-up
  OPEN: 'blue',
  COMPLETED: 'green',
  // Users / customers / architects / tenants
  ACTIVE: 'green',
  INACTIVE: 'gray',
  SUSPENDED: 'red',
  BLOCKED: 'red',
  LEAD: 'orange',
  PROSPECT: 'orange',
  PENDING_APPROVAL: 'orange',
  // Subscriptions
  TRIAL: 'purple',
  GRACE_PERIOD: 'orange',
};

export function StatusBadge({ status }: { status: string }) {
  const key = status?.toUpperCase().replace(/\s+/g, '_') ?? '';
  const color = colorMap[key] ?? 'gray';
  return (
    <Badge colorPalette={color} variant="subtle" size="sm" borderRadius="full" px={2} py={0.5} fontWeight={500} fontSize="xs">
      {formatEnum(status)}
    </Badge>
  );
}
