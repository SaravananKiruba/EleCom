@AGENTS.md

# EleCom Project — What's Been Built

## Stack
- **Next.js 16** (App Router) + **TypeScript** + **Chakra UI v3**
- Pure frontend demo — no backend, localStorage persistence via `AppContext`
- Dev: `npm run dev` → http://localhost:3000 | Build: `npm run build`

## Domain
Lighting company (LED panels, downlights, battens, bulbs, track lights, high bay, flood, street lights).  
Brand: CVS — theme colors `#6b8375`, `#92b29b`, `#c6e3c5` overriding Chakra blue palette.

## Route Structure
```
/(public)/          → PublicLayout (header + footer)
  /                 → HomePage (landing)
  /catalogue        → Product catalogue with filters
  /products/[slug]  → Product detail
  /quote-cart       → Quote cart (add items before RFQ)
  /rfq              → Submit RFQ form
  /quotation/[id]   → View shared quote
  /dashboard        → Customer dashboard (orders, quotes)
  /architect-partner → Architect programme info / registration

/admin/             → AdminLayout (sidebar nav)
  /                 → KPI dashboard
  /rfqs             → Manage RFQs
  /quotations       → Manage quotes
  /purchase-orders  → Manage sales orders (SOs)
  /follow-ups       → Follow-up tracker
  /customers        → Customer CRM
  /architects       → Architect partner management
  /products         → Product catalogue admin
  /reports          → Reports page

/login/             → Login page
```

## Auth — `/context/AuthContext.tsx`
Roles: `guest` | `customer` | `architect` | `admin`

## State — `/context/AppContext.tsx`
Manages all entities in memory + localStorage. Key actions include `UPDATE_PO`.

## Data Model — `/types/index.ts`
| Type | Key fields |
|------|-----------|
| `Product` | sku, slug, brandId, categoryId, specifications, variants, documents |
| `RFQ` | rfqNumber, customerId, items[], status, timeline[] |
| `Quote` | quoteNumber, rfqId, lineItems[], status, sharedAt |
| `PurchaseOrder` | poNumber, soNumber, dispatchDate, dueDate, trackingId, status |
| `FollowUp` | quoteId, method, lastContact, nextFollowUp, status |
| `Customer` | companyName, gst, city, status |
| `Architect` | firmName, licenseNumber, discount, discountHistory[] |

### Enums
- `RFQStatus`: New | Under Review | Quote Ready | Follow-Up | Accepted | Rejected | Expired
- `QuoteStatus`: Draft | Shared | Follow-Up | Negotiation | Accepted | Rejected | Expired | **Converted to SO** (no "Pending Approval" or "Converted to PO")
- `POStatus`: Active | Dispatched | Delivered | Cancelled
- Quote flow: RFQ → Quote (auto-Shared, no approval step) → Won → Sales Order (SO)

## Shared UI Components — `/components/ui/`
- `SidePanel` — all admin detail panels (NOT Chakra DrawerRoot)
- `StatusBadge` — coloured badge per status value
- `KPICard` — metric cards for dashboard
- `PageHeader` — page title + action button
- `SearchInput` — debounced search box
- `Pagination` — page controls
- `EmptyState` — zero-results placeholder
- `Toaster` — Chakra v3 toaster (children render fn)

## Layout Components — `/components/layout/`
- `PublicHeader`, `PublicFooter`

## Chakra UI v3 Conventions
- `createSystem` + `ChakraProvider value={system}`
- `DialogRoot`, `DrawerRoot`, `TabsRoot`
- `DialogContent` always includes `maxW={{ base: '95vw', md: '520px' }} mx="auto"`
- Admin layout mobile nav: pure CSS slide panel (NOT DrawerRoot)
- Table rows: clickable via `onClick` + `cursor: pointer` (no separate "View" button)

## Mock Data — `/data/mockData.ts`
Seed data for all entities (products, RFQs, quotes, customers, architects, POs, follow-ups).

