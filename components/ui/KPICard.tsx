'use client';

import { Box, Text, Flex, HStack } from '@chakra-ui/react';

interface KPICardProps {
  label: string;
  value: string | number;
  icon?: string;
  colorScheme?: string;
  sub?: string;
}

export function KPICard({ label, value, icon, colorScheme = 'blue', sub }: KPICardProps) {
  const colors: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue:   { bg: '#ebf4ff', text: '#1a56db', iconBg: '#bee3f8' },
    green:  { bg: '#f0fff4', text: '#276749', iconBg: '#c6f6d5' },
    orange: { bg: '#fffaf0', text: '#c05621', iconBg: '#feebc8' },
    purple: { bg: '#faf5ff', text: '#553c9a', iconBg: '#e9d8fd' },
    red:    { bg: '#fff5f5', text: '#c53030', iconBg: '#fed7d7' },
    teal:   { bg: '#e6fffa', text: '#234e52', iconBg: '#b2f5ea' },
  };
  const c = colors[colorScheme] || colors.blue;

  return (
    <Box bg="white" rounded="xl" p={5} shadow="sm" border="1px solid" borderColor="gray.100" h="full">
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Text fontSize="xs" color="gray.500" fontWeight={500} textTransform="uppercase" letterSpacing="wide" mb={1}>
            {label}
          </Text>
          <Text fontSize="2xl" fontWeight={700} color="gray.900" lineHeight="none">
            {value}
          </Text>
          {sub && <Text fontSize="xs" color="gray.400" mt={1}>{sub}</Text>}
        </Box>
        {icon && (
          <Box bg={c.bg} color={c.text} rounded="lg" p={2} fontSize="xl">
            {icon}
          </Box>
        )}
      </Flex>
    </Box>
  );
}
