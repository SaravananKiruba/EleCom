'use client';

import { Box, Text, VStack } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <VStack py={16} gap={4} textAlign="center">
      <Text fontSize="4xl">{icon}</Text>
      <Text fontSize="lg" fontWeight={600} color="gray.700">{title}</Text>
      {description && <Text color="gray.500" maxW="sm">{description}</Text>}
      {action && <Box mt={2}>{action}</Box>}
    </VStack>
  );
}
