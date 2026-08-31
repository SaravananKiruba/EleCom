import { NextRequest, NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'crmboo-dev-secret-change-in-production';
const COOKIE = 'crmboo_token';

interface JWTPayload { role: string; }

const PROTECTED: { path: string; roles: string[] }[] = [
  { path: '/admin', roles: ['TENANT_ADMIN', 'SALES'] },
  { path: '/saas-admin', roles: ['SAAS_ADMIN'] },
  { path: '/dashboard', roles: ['CUSTOMER'] },
  { path: '/architect-portal', roles: ['ARCHITECT'] },
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const rule = PROTECTED.find(r => pathname === r.path || pathname.startsWith(r.path + '/'));
  if (!rule) return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return NextResponse.redirect(new URL('/login', req.url));

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
    if (!rule.roles.includes(payload.role)) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/saas-admin/:path*', '/dashboard/:path*', '/architect-portal/:path*'],
};
