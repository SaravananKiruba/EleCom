// Shared display formatter for Prisma enum values.
export function formatEnum(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .split('_')
    .map(w => w.length === 0 ? w : w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatCurrency(n: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

/** ISO date string (yyyy-mm-dd) for the client's current day. */
export function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

/** Full ISO timestamp for "now". */
export function nowIso(): string {
  return new Date().toISOString();
}

/** True when an ISO date (yyyy-mm-dd or full ISO) is strictly before today. */
export function isOverdue(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const target = new Date(iso).getTime();
  const startOfToday = new Date(new Date().toISOString().split('T')[0]).getTime();
  return target < startOfToday;
}
