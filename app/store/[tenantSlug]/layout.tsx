import { ReactNode } from 'react';
import { StoreHeader } from '@/components/layout/StoreHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { TenantStoreProvider } from '@/context/TenantStoreContext';

export default async function StoreLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;

  return (
    <TenantStoreProvider slug={tenantSlug}>
      <StoreHeader tenantSlug={tenantSlug} />
      <main>{children}</main>
      <PublicFooter />
    </TenantStoreProvider>
  );
}
