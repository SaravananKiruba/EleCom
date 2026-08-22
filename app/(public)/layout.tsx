import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { Toaster } from '@/components/ui/toaster';
import { Box } from '@chakra-ui/react';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box minH="100vh" display="flex" flexDirection="column" bg="gray.50">
      <PublicHeader />
      <Box flex={1}>{children}</Box>
      <PublicFooter />
      <Toaster />
    </Box>
  );
}
