@AGENTS.md

# EleCom Project — Current Snapshot

## Stack
- **Next.js 16** (App Router) + **TypeScript** + **React 19** + **Chakra UI v3**
- **Prisma 5** + **MySQL** backend with API routes under `app/api/*`
- Auth/session helpers in `src/server/auth.ts` with `jsonwebtoken` + `bcryptjs`
- Dev: `npm run dev` | Build: `npm run build` (runs `prisma generate` first)

## Product Shape
- Multi-tenant SaaS for electrical/lighting CRM + quote-to-order workflows.
- Three major surfaces:
  - Public marketing and onboarding
  - Tenant admin operations (`/admin/*`)
  - Tenant storefront (`/store/[tenantSlug]/*`)
- Separate SaaS owner console at `/saas-admin/*` for tenant/subscription management.

## App Route Structure
```
/(public)/
  /                     → Public homepage
  /architect-partner    → Architect partner landing
  /architect-portal     → Architect portal page

/login                  → Login page
/signup                 → Signup page
/join                   → Join page

/admin/
  /                     → Tenant admin dashboard
  /rfqs                 → RFQ management
  /quotations           → Quote management
  /sales-orders         → Sales order management
  /follow-ups           → Follow-up tracker
  /customers            → Customer CRM
  /architects           → Architect management
  /products             → Product catalog admin
  /reports              → Reports
  /audit                → Audit logs page
  /settings             → Tenant settings
  /team                 → Team/users page

/saas-admin/
  /                     → SaaS admin dashboard
  /tenants              → Tenant management
  /subscriptions        → Subscription management

/store/[tenantSlug]/
  /                     → Tenant store landing
  /catalogue            → Product catalogue
  /products/*           → Product pages
  /quote-cart           → Tenant-scoped quote cart
  /rfq                  → RFQ submission
  /quotation/*          → Shared quote views
  /dashboard            → Customer dashboard
```

## API Surface (App Router)
- Core business APIs:
  - `/api/products`, `/api/categories`, `/api/brands`
  - `/api/customers`, `/api/architects`, `/api/rfqs`, `/api/quotes`
  - `/api/follow-ups`, `/api/sales-orders`
- Platform APIs:
  - `/api/tenants`, `/api/subscriptions`, `/api/users`
  - `/api/audit-logs`, `/api/activities`
- Auth APIs:
  - `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/signup`, `/api/auth/join`
- Store resolution APIs:
  - `/api/store/[tenantSlug]`, `/api/store/by-domain`, `/api/store/domains`, `/api/store/settings`

## Auth and Roles
- Client auth context: `context/AuthContext.tsx`
- Supported roles:
  - `SAAS_ADMIN`
  - `TENANT_ADMIN`
  - `SALES`
  - `CUSTOMER`
  - `ARCHITECT`
  - `guest` (client fallback user)

## State Management
- `context/AppContext.tsx`
  - Now focused on tenant-scoped quote-cart state in localStorage (`crmboo:cart:v2`).
  - Carts are isolated per tenant slug (`cartsByTenant`).
- `context/TenantStoreContext.tsx`
  - Loads and provides current tenant storefront metadata from `/api/store/[slug]`.

## Data Model
- UI types in `types/index.ts` are aligned with Prisma enums (UPPER_SNAKE_CASE).
- Core entities include:
  - `Tenant`, `UserRecord`
  - `Product`, `Category`, `Brand`
  - `Customer`, `Architect`
  - `RFQ`, `Quote`, `SalesOrder`, `FollowUp`
- Server schema is in `prisma/schema.prisma` with tenant-aware relations and audit/subscription tables.

### Workflow Enums (high-signal)
- `RFQStatus`: `NEW`, `UNDER_REVIEW`, `QUOTE_READY`, `FOLLOW_UP`, `ACCEPTED`, `REJECTED`, `EXPIRED`
- `QuoteStatus`: `DRAFT`, `SHARED`, `FOLLOW_UP`, `NEGOTIATION`, `ACCEPTED`, `REJECTED`, `EXPIRED`, `CONVERTED_TO_SO`
- `SalesOrderStatus`: `ACTIVE`, `DISPATCHED`, `DELIVERED`, `CANCELLED`

## Shared UI Components
- In `components/ui/`:
  - `ActivityTimeline`
  - `EmptyState`
  - `KPICard`
  - `PageHeader`
  - `Pagination`
  - `SearchInput`
  - `SidePanel`
  - `StatusBadge`
  - `toaster`

## Layout Components
- In `components/layout/`:
  - `PublicHeader`
  - `PublicFooter`
  - `StoreHeader`

## Server Utilities
- Tenant/auth/server infrastructure under `src/server/`:
  - `prisma.ts`, `auth.ts`, `resolveTenant.ts`, `tenantContext.ts`, `vercelApi.ts`
  - Service layer in `src/server/services/*` for RFQs, quotes, orders, products, customers, follow-ups, audit, sequences, and tenants.

