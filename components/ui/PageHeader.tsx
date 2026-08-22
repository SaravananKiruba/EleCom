'use client';

import { Box, Flex, Text, HStack, Button } from '@chakra-ui/react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumb?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions, breadcrumb }: PageHeaderProps) {
  return (
    <Box mb={6}>
      {breadcrumb && <Box mb={2}>{breadcrumb}</Box>}
      <Flex align="center" justify="space-between" gap={4} flexWrap="wrap">
        <Box>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight={700} color="gray.900" lineHeight="short">
            {title}
          </Text>
          {subtitle && (
            <Text mt={0.5} fontSize="sm" color="gray.500">{subtitle}</Text>
          )}
        </Box>
        {actions && <HStack gap={2}>{actions}</HStack>}
      </Flex>
    </Box>
  );
}
