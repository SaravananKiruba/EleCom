'use client';

import { Badge } from '@chakra-ui/react';

type StatusType = string;

const colorMap: Record<string, string> = {
  New: 'blue',
  'Under Review': 'orange',
  'Quote Ready': 'purple',
  'Follow-Up': 'yellow',
  Accepted: 'green',
  Rejected: 'red',
  Expired: 'gray',
  Draft: 'gray',
  'Pending Approval': 'orange',
  Approved: 'green',
  Shared: 'blue',
  Negotiation: 'purple',
  'Converted to PO': 'teal',
  Scheduled: 'blue',
  Completed: 'green',
  Overdue: 'red',
  Cancelled: 'gray',
  Pending: 'orange',
  Suspended: 'red',
  Active: 'green',
  Inactive: 'gray',
  Won: 'green',
  Lost: 'red',
  Delivered: 'teal',
};

export function StatusBadge({ status }: { status: StatusType }) {
  const color = colorMap[status] || 'gray';
  return (
    <Badge colorPalette={color} variant="subtle" size="sm" borderRadius="full" px={2} py={0.5} fontWeight={500} fontSize="xs">
      {status}
    </Badge>
  );
}
