import { NextRequest, NextResponse } from 'next/server';

// Domains that belong to the platform itself — not tenant custom domains
const PLATFORM_DOMAINS = [
  'localhost',
  'vercel.app',
];

export async function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? '';
  const hostname = host.split(':')[0]; // strip port for localhost

  // If it's a platform domain, pass through normally
  if (PLATFORM_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`))) {
    return NextResponse.next();
  }

  // Look up which tenant owns this custom domain
  const lookupUrl = `${req.nextUrl.origin}/api/store/by-domain?domain=${hostname}`;
  try {
    const res = await fetch(lookupUrl, { headers: { 'x-middleware-request': '1' } });
    if (!res.ok) return NextResponse.next();

    const { tenantSlug } = await res.json();
    if (!tenantSlug) return NextResponse.next();

    // Rewrite the request to the tenant's store route, preserving path & query
    const url = req.nextUrl.clone();
    url.pathname = `/store/${tenantSlug}${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  // Skip static files, _next internals, and API routes (except the by-domain lookup called above)
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
