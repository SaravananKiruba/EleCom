import { NextRequest, NextResponse } from 'next/server';

const PLATFORM_HOSTS = ['localhost', 'crmboo.io', 'crmboo.com', 'www.crmboo.com', 'www.crmboo.io'];

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get('host') ?? '';
  const hostname = host.split(':')[0]; // strip port

  // Skip internal paths
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/static') ||
    url.pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // ── 1. Subdomain of platform: [slug].crmboo.com ──────────────────────────
  const platformRoot = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'crmboo.io';
  if (hostname.endsWith(`.${platformRoot}`)) {
    const tenantSlug = hostname.replace(`.${platformRoot}`, '');
    if (tenantSlug && tenantSlug !== 'www') {
      // Rewrite to /store/[tenantSlug]/[path]
      const rewritePath = `/store/${tenantSlug}${url.pathname === '/' ? '' : url.pathname}`;
      url.pathname = rewritePath;
      return NextResponse.rewrite(url);
    }
  }

  // ── 2. Custom domain: look up in DB ──────────────────────────────────────
  if (!PLATFORM_HOSTS.includes(hostname) && !hostname.endsWith(`.${platformRoot}`)) {
    try {
      const lookup = await fetch(
        `${req.nextUrl.origin}/api/store/by-domain?domain=${encodeURIComponent(hostname)}`,
        { cache: 'no-store' },
      );
      if (lookup.ok) {
        const { tenantSlug } = await lookup.json();
        const rewritePath = `/store/${tenantSlug}${url.pathname === '/' ? '' : url.pathname}`;
        url.pathname = rewritePath;
        const res = NextResponse.rewrite(url);
        // Cache the resolved tenant in cookie to avoid repeated lookups
        res.cookies.set('crmboo-tenant-slug', tenantSlug, { maxAge: 3600, path: '/' });
        return res;
      }
    } catch {
      // Domain not found — fall through to normal routing
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
