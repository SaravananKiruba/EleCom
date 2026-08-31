import { ReactNode } from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
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
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </TenantStoreProvider>
  );
}
