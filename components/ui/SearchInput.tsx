'use client';

import { Box, Input, InputGroup } from '@chakra-ui/react';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
  return (
    <Box position="relative">
      <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" color="gray.400" pointerEvents="none" zIndex={1}>
        🔍
      </Box>
      <Input
        pl={9}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
        borderRadius="lg"
        size="md"
      />
    </Box>
  );
}
