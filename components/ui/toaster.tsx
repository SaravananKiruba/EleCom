'use client';

import { createToaster, Toaster as ChakraToaster, ToastRoot, ToastTitle, ToastDescription, ToastCloseTrigger, ToastIndicator } from '@chakra-ui/react';

export const toaster = createToaster({ placement: 'top-end', pauseOnPageIdle: true });

export function Toaster() {
  return (
    <ChakraToaster toaster={toaster}>
      {(toast) => (
        <ToastRoot key={toast.id}>
          <ToastIndicator />
          <ToastTitle>{toast.title as string}</ToastTitle>
          {toast.description && <ToastDescription>{toast.description as string}</ToastDescription>}
          <ToastCloseTrigger />
        </ToastRoot>
      )}
    </ChakraToaster>
  );
}
