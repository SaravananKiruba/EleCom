'use client';

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { AppProvider } from '@/context/AppContext';
import { ReactNode } from 'react';

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` },
        body: { value: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <AppProvider>{children}</AppProvider>
    </ChakraProvider>
  );
}
