import { NextRequest, NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';
import { getJwtSecret, AUTH_COOKIE } from '@/src/server/auth';

const PLATFORM_HOSTS = ['localhost', 'crmboo.io', 'crmboo.com', 'www.crmboo.com', 'www.crmboo.io'];

interface JWTPayload { role: string; }

const PROTECTED: { path: string; roles: string[] }[] = [
  { path: '/admin', roles: ['TENANT_ADMIN', 'SALES'] },
  { path: '/saas-admin', roles: ['SAAS_ADMIN'] },
  { path: '/dashboard', roles: ['CUSTOMER'] },
  { path: '/architect-portal', roles: ['ARCHITECT'] },
];

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get('host') ?? '';
  const hostname = host.split(':')[0];
  const { pathname } = req.nextUrl;

  // ── Auth guard ─────────────────────────────────────────────────────────
  const rule = PROTECTED.find(r => pathname === r.path || pathname.startsWith(r.path + '/'));
  if (rule) {
    const token = req.cookies.get(AUTH_COOKIE)?.value;
    if (!token) return NextResponse.redirect(new URL('/login', req.url));
    try {
      const payload = jwt.verify(token, getJwtSecret()) as JWTPayload;
      if (!rule.roles.includes(payload.role)) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // Skip internal paths for domain routing
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // ── Subdomain: [slug].crmboo.com ───────────────────────────────────────
  const platformRoot = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'crmboo.io';
  if (hostname.endsWith(`.${platformRoot}`)) {
    const tenantSlug = hostname.replace(`.${platformRoot}`, '');
    if (tenantSlug && tenantSlug !== 'www') {
      const rewritePath = `/store/${tenantSlug}${url.pathname === '/' ? '' : url.pathname}`;
      url.pathname = rewritePath;
      return NextResponse.rewrite(url);
    }
  }

  // ── Custom domain lookup ───────────────────────────────────────────────
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
        res.cookies.set('crmboo-tenant-slug', tenantSlug, { maxAge: 3600, path: '/' });
        return res;
      }
    } catch {
      // Domain not found — fall through
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
