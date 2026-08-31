import { NextRequest, NextResponse } from 'next/server';
import * as jwt from 'jsonwebtoken';

const COOKIE = 'crmboo_token';

let cachedSecret: string | null = null;

/** Resolves JWT secret lazily so the build step doesn't fail when the env var is only set at runtime. */
export function getJwtSecret(): string {
  if (cachedSecret) return cachedSecret;
  const s = process.env.JWT_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is not set. Refusing to sign or verify tokens in production without a signing key.');
    }
    cachedSecret = 'crmboo-dev-secret-change-in-production';
    return cachedSecret;
  }
  cachedSecret = s;
  return cachedSecret;
}

export const AUTH_COOKIE = COOKIE;

export type Role = 'SAAS_ADMIN' | 'TENANT_ADMIN' | 'SALES' | 'CUSTOMER' | 'ARCHITECT';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  tenantId?: string;
  tenantName?: string;
  tenantSlug?: string;
  customerId?: string;
  architectId?: string;
}

export function readToken(req: NextRequest): AuthUser | null {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, getJwtSecret()) as AuthUser;
  } catch {
    return null;
  }
}

export function signToken(payload: AuthUser): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

/** Enforces authentication. Returns the user or a 401 NextResponse. */
export function requireAuth(req: NextRequest): AuthUser | NextResponse {
  const user = readToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return user;
}

/** Enforces authentication and a specific set of roles. */
export function requireRole(req: NextRequest, roles: Role[]): AuthUser | NextResponse {
  const user = readToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!roles.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return user;
}

/** Enforces auth + a tenantId claim. Prevents SaaS admin from unintentionally accessing tenant-scoped APIs. */
export function requireTenant(req: NextRequest): AuthUser | NextResponse {
  const user = readToken(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!user.tenantId) return NextResponse.json({ error: 'Tenant context required' }, { status: 403 });
  return user;
}

export function isResponse(v: unknown): v is NextResponse {
  return v instanceof NextResponse;
}
