'use client';

import { ChakraProvider, createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider } from '@/context/AuthContext';
import { DemoSwitcher } from '@/components/ui/DemoSwitcher';
import { ReactNode } from 'react';

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` },
        body: { value: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif` },
      },
      colors: {
        // Override blue palette with CVS brand greens
        blue: {
          50: { value: '#f0f7f3' },
          100: { value: '#c6e3c5' },
          200: { value: '#b2c8a2' },
          300: { value: '#98b28f' },
          400: { value: '#92b29b' },
          500: { value: '#7d9887' },
          600: { value: '#6b8375' },
          700: { value: '#5a6e63' },
          800: { value: '#485a50' },
          900: { value: '#37463e' },
          950: { value: '#25322d' },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <AuthProvider>
        <AppProvider>
          {children}
          <DemoSwitcher />
        </AppProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}
