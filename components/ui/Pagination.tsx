'use client';

import { HStack, Button, Text } from '@chakra-ui/react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <HStack justify="center" gap={2} py={4}>
      <Button size="sm" variant="outline" onClick={() => onChange(page - 1)} disabled={page === 1}>← Prev</Button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <Button
          key={p}
          size="sm"
          variant={p === page ? 'solid' : 'outline'}
          colorPalette={p === page ? 'blue' : 'gray'}
          onClick={() => onChange(p)}
        >
          {p}
        </Button>
      ))}
      <Button size="sm" variant="outline" onClick={() => onChange(page + 1)} disabled={page === totalPages}>Next →</Button>
    </HStack>
  );
}
