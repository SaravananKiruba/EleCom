import type { Metadata } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'CRMBoo — B2B Lighting CRM & E-Commerce',
  description: 'Multi-tenant B2B sales platform and CRM for lighting and electrical products.',
  icons: {
    icon: '/crmboo-logo.png',
    apple: '/crmboo-logo.png',
  },
  openGraph: {
    title: 'CRMBoo',
    description: 'Multi-tenant B2B sales platform and CRM for lighting and electrical products.',
    images: [{ url: '/crmboo-logo.png', width: 1080, height: 1080, alt: 'CRMBoo' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0, minHeight: '100vh', backgroundColor: '#f7f8fa' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
