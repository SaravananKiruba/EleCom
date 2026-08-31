import { redirect } from 'next/navigation';

export default async function StoreHomePage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  redirect(`/store/${tenantSlug}/catalogue`);
}
