// Vercel Domains API — requires VERCEL_API_TOKEN + VERCEL_PROJECT_ID env vars
const BASE = 'https://api.vercel.com';
const TOKEN = process.env.VERCEL_API_TOKEN;
const PROJECT_ID = process.env.VERCEL_PROJECT_ID;

function headers() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  };
}

export interface VercelDomainResult {
  apexName: string;
  name: string;
  verified: boolean;
  verification?: { type: string; domain: string; value: string; reason: string }[];
  configuredBy?: string | null;
  // id returned by Vercel for later deletion
  uid?: string;
}

/** Add a custom domain to the Vercel project. Returns Vercel's domain object. */
export async function vercelAddDomain(domain: string): Promise<VercelDomainResult> {
  const res = await fetch(`${BASE}/v10/projects/${PROJECT_ID}/domains`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name: domain }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Vercel API error ${res.status}`);
  }
  return res.json();
}

/** Remove a custom domain from the Vercel project. */
export async function vercelRemoveDomain(domain: string): Promise<void> {
  const res = await fetch(`${BASE}/v9/projects/${PROJECT_ID}/domains/${domain}`, {
    method: 'DELETE',
    headers: headers(),
  });
  // 404 is fine — domain may already be gone
  if (!res.ok && res.status !== 404) {
    throw new Error(`Vercel remove domain error ${res.status}`);
  }
}

/** Check current verification status of a domain. */
export async function vercelGetDomain(domain: string): Promise<VercelDomainResult> {
  const res = await fetch(`${BASE}/v9/projects/${PROJECT_ID}/domains/${domain}`, {
    headers: headers(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Vercel API error ${res.status}`);
  }
  return res.json();
}
