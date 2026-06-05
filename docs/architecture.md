# Avokado — System Architecture

Avokado is a premium SaaS that automates ecommerce advertising. It is a single
Next.js 16 application (App Router, React 19 Server Components) written in
strict TypeScript, backed by PostgreSQL via Drizzle ORM, with a typed adapter
layer in front of every third-party service so the product never hard-depends on
any one vendor.

This document describes how the system is layered, how a request flows through
it, how data and tenancy are modeled, and the security posture that protects
customer credentials and data.

---

## 1. Design principles

- **Server-first.** Pages and most data access run as React Server Components
  and server actions. The browser receives data, not secrets.
- **Strict layering.** Each layer only talks to the layer directly beneath it.
  UI never reaches into the database; jobs and services never read HTTP request
  objects.
- **Vendor independence.** Every integration (Meta, Shopify, WooCommerce,
  Stripe, storage, AI) is reached through a typed adapter interface with both a
  **Mock** and a **Live** implementation. The app depends on the interface,
  never on a concrete vendor client.
- **Multi-tenant by construction.** Every business record carries a
  `workspaceId`. Authorization is enforced at the service boundary, not left to
  individual queries.
- **Fail safe and labelled.** With zero third-party credentials the entire app
  runs in **mock mode**; each mock is clearly labelled so it is never confused
  with real data.

---

## 2. Layered architecture

Control flows top-to-bottom; each layer depends only on the one below it.

```
┌─────────────────────────────────────────────────────────────┐
│  UI components            app/**, components/**              │  RSC + client islands
├─────────────────────────────────────────────────────────────┤
│  Feature modules          server actions, route handlers     │  orchestrate a use case
├─────────────────────────────────────────────────────────────┤
│  Domain services          lib/workspace, lib/* services      │  business rules
├─────────────────────────────────────────────────────────────┤
│  Integration adapters     lib/integrations/*                 │  Mock | Live per vendor
├─────────────────────────────────────────────────────────────┤
│  Background jobs          Inngest functions                  │  async / durable work
├─────────────────────────────────────────────────────────────┤
│  Data access              Drizzle ORM, lib/db                │  typed SQL, snake_case
├─────────────────────────────────────────────────────────────┤
│  Policy / authz           lib/auth/session, lib/policy       │  RBAC, tenant scoping
├─────────────────────────────────────────────────────────────┤
│  Validation               Zod schemas (lib/validations)      │  parse, never trust input
└─────────────────────────────────────────────────────────────┘
```

Cross-cutting concerns sit beside the stack rather than inside a single layer:

- **Security & crypto** — `lib/crypto/encryption` (AES-256-GCM at rest),
  `lib/security` (headers, redaction, secret handling).
- **Errors** — `lib/errors` provides one standardized error taxonomy used by
  every layer (see §7).
- **Configuration** — `lib/env` validates server env at startup;
  `lib/env-public` exposes the small allow-list of client-safe values.

### Layer responsibilities

| Layer | Owns | Must not |
| --- | --- | --- |
| UI components | Rendering, accessibility, client interactivity | Touch the database, hold secrets |
| Feature modules | One use case end-to-end (a server action / route handler) | Contain reusable business rules |
| Domain services | Business rules, invariants, orchestration of adapters + data | Read `Request`/cookies directly |
| Integration adapters | Talking to one external API behind a typed interface | Leak vendor types upward |
| Background jobs | Long-running, retryable, scheduled work | Assume an HTTP request context |
| Data access | Typed queries, transactions, migrations | Make authorization decisions alone |
| Policy / authz | Session resolution, role checks, tenant scoping | Perform business logic |
| Validation | Parsing and shaping untrusted input with Zod | Trust client-provided values |

---

## 3. Request lifecycle

The two primary entry points are **server actions** (form submissions, mutations
from the dashboard) and **route handlers** (`app/api/**`, webhooks, auth
callbacks). Both follow the same shape.

```
Browser ─▶ Next.js (App Router)
   │
   1. Routing & rendering
   │     RSC page or server action / route handler is selected
   │
   2. Authentication            lib/auth/session
   │     getSession() resolves the Better Auth session (cached per request)
   │     requireUser() redirects to /login if unauthenticated
   │
   3. Tenant resolution         lib/auth/session
   │     active workspace read from cookie "avokado_active_ws"
   │     membership + role loaded → WorkspaceContext
   │
   4. Authorization             lib/policy
   │     role check (owner > admin > marketer > analyst > viewer)
   │     AuthorizationError thrown if the role is insufficient
   │
   5. Validation                lib/validations (Zod)
   │     input is parsed; ValidationError (422) on failure
   │
   6. Domain service            lib/workspace, lib/* services
   │     business rules run; all queries are scoped by workspaceId
   │
   7. Integration adapter       lib/integrations/* (when external I/O is needed)
   │     Mock or Live selected by AVOKADO_MODE + credential presence
   │     secrets decrypted just-in-time from the DB (AES-256-GCM)
   │
   8. Data access               lib/db (Drizzle)
   │     typed SQL inside a transaction where needed
   │
   9. Async hand-off            Inngest (optional)
   │     long work is enqueued as an event; the request returns promptly
   │
  10. Response
         RSC re-renders with fresh data, or a typed JSON result is returned;
         AppError → { code, message } with a safe userMessage and HTTP status
```

**Worked example — connecting a store and kicking off an inspection**

1. The integrations page submits a server action with the store URL and
   platform.
2. `requireWorkspace("marketer")` resolves the session, the active workspace,
   and asserts the caller has at least the marketer role.
3. A Zod schema parses the payload.
4. The store service persists a `stores` row (scoped to `workspaceId`) with
   `connection_status = "pending"`.
5. The relevant adapter (Shopify / WooCommerce / website) verifies the
   connection; in mock mode a labelled mock adapter returns deterministic data.
6. Any returned token is encrypted with AES-256-GCM **before** it touches the
   database; it is never returned to the browser or logged.
7. An Inngest event enqueues the inspection pipeline
   (`queued → discovering → extracting → analyzing → building → complete`),
   updating the `inspection_status` enum as it advances.
8. The action returns; the dashboard re-renders showing the store as connected
   and the inspection in progress.

---

## 4. Data model

- **Engine:** PostgreSQL 16, accessed exclusively through **Drizzle ORM**.
- **Conventions:** `snake_case` columns (enforced via `casing: "snake_case"`),
  **cuid2** primary keys, `created_at` / `updated_at` timestamps, and
  `deleted_at` soft-delete on tables where history matters.
- **Tenancy:** every business table carries a non-null `workspace_id` foreign
  key. Tenant isolation is a structural property of the schema.
- **Scale:** ~49 tables. Schema lives in `lib/db/schema/*` and is re-exported
  from `lib/db/schema/index.ts`. SQL migrations are generated into `/drizzle`.

### Schema modules (`lib/db/schema/`)

| Module | Purpose |
| --- | --- |
| `enums.ts` | Shared PostgreSQL enums (roles, platforms, statuses, etc.) |
| `auth.ts` | Better Auth tables: users, sessions, accounts, verification |
| `workspaces.ts` | Workspaces, memberships, roles, invitations, subscription state |
| `stores.ts` | Connected ecommerce stores and their connection status |
| `brand.ts` | Brand intelligence: voice, audience, positioning |
| `assets.ts` | Generated and uploaded creative assets |
| `meta.ts` | Meta (Facebook/Instagram) ad entities and linkage |
| `campaigns.ts` | Campaigns, ad sets, recommendations, approvals |

### Representative enums

`workspace_role` (`owner`, `admin`, `marketer`, `analyst`, `viewer`),
`ecommerce_platform` (`shopify`, `woocommerce`, `website`),
`connection_status` (`disconnected`, `pending`, `connected`, `error`,
`revoked`), `inspection_status` (`queued … complete`/`failed`), `job_status`
(`queued`, `running`, `succeeded`, `failed`, `cancelled`),
`subscription_status` (`trialing`, `active`, `past_due`, `canceled`,
`incomplete`, `none`), `confidence_level` (`low`/`medium`/`high`), and
`approval_state` (`draft` …).

---

## 5. Integration adapter pattern

Every external dependency hides behind a typed TypeScript interface in
`lib/integrations/*`. Each integration ships two implementations:

- **Mock** — deterministic, offline, clearly labelled output. Used whenever
  credentials are missing or `AVOKADO_MODE=mock`.
- **Live** — the real vendor client, used only when `AVOKADO_MODE=live` **and**
  the required credentials are present.

```
                        ┌──────────────────────────┐
   domain service ─────▶│   Adapter interface (TS) │
                        └─────────────┬────────────┘
                          selected by AVOKADO_MODE
                          + credential presence
                  ┌───────────────┴───────────────┐
                  ▼                                ▼
          ┌──────────────┐                 ┌──────────────┐
          │ Mock adapter │                 │ Live adapter │
          │ (labelled)   │                 │ (real API)   │
          └──────────────┘                 └──────────────┘
```

This yields three guarantees:

1. **Local-first.** The whole product runs end-to-end with no vendor accounts.
2. **Swappable.** Adding or replacing a vendor means writing one adapter; no
   caller changes.
3. **Testable.** Mocks make domain services deterministic in unit tests.

Adapters cover, at minimum: Meta Marketing API, Shopify, WooCommerce, Stripe
billing, object storage (S3-compatible / Cloudflare R2), email (Resend), and AI
(Google Vertex / Gemini) for brand intelligence and structured generation.

---

## 6. Authentication & multi-tenancy

- **Auth provider:** **Better Auth** on the Drizzle adapter — email/password
  with optional Google OAuth. Auth routes are served from
  `app/api/auth/[...all]`.
- **Session resolution:** `lib/auth/session` exposes a per-request cached
  `getSession()`, `requireUser()` (redirects to `/login`), and
  `requireWorkspace(role?)` which returns a `WorkspaceContext`
  (`user`, `workspace`, `workspaces`, `role`).
- **Active workspace:** chosen via the `avokado_active_ws` cookie
  (`ACTIVE_WS_COOKIE`). Membership and role are loaded for that workspace on
  every request.
- **RBAC:** five ordered roles — **owner > admin > marketer > analyst >
  viewer** — compared with `roleAtLeast`. Insufficient privilege raises
  `AuthorizationError` (HTTP 403).
- **Isolation:** because every business query is scoped by `workspaceId`, a user
  can only ever read or mutate data inside a workspace they belong to.

---

## 7. Error handling

`lib/errors` defines one taxonomy used across every layer. Each error carries a
stable `code`, an HTTP `httpStatus`, a safe `userMessage` for the UI, optional
internal `details` (never shown to users), and a `retryable` flag.

| Error | Code | HTTP | Typical cause |
| --- | --- | --- | --- |
| `ValidationError` | `validation_error` | 422 | Zod parse failed |
| `AuthenticationError` | `authentication_error` | 401 | No / invalid session |
| `AuthorizationError` | `authorization_error` | 403 | Role too low for action |
| `IntegrationSetupError` | `integration_setup_error` | — | Missing / bad credentials |
| `ExternalApiError` | `external_api_error` | — | Vendor API failure |
| `RateLimitError` | `rate_limit_error` | 429 | Upstream throttling |
| `RetryableJobError` | `retryable_job_error` | — | Transient job failure → retry |
| `NonRetryableJobError` | `non_retryable_job_error` | — | Permanent job failure |

`AppError.toJSON()` returns only `{ code, message }`, guaranteeing internal
details never cross the network boundary. Jobs use the Retryable /
NonRetryable distinction to drive Inngest's retry behavior.

---

## 8. Background jobs

Long-running, scheduled, or fan-out work runs as **Inngest** functions rather
than inside the request path. Jobs are event-driven and durable: a server action
emits an event and returns immediately; the function executes, retries on
`RetryableJobError`, and records progress through the `job_status` /
`inspection_status` enums so the UI can reflect live state. The store-inspection
pipeline (discovery → extraction → analysis → build) is the canonical example.

---

## 9. Security posture

- **Secrets at rest:** all third-party tokens are encrypted with **AES-256-GCM**
  (`lib/crypto/encryption`) using `ENCRYPTION_KEY`. Plaintext secrets are
  decrypted just-in-time inside adapters and **never** sent to the browser or
  written to logs.
- **Server-only boundaries:** sensitive modules import `server-only`; only the
  vetted values in `lib/env-public` are exposed to the client.
- **Validated configuration:** `lib/env` validates required server env at
  startup, failing fast on misconfiguration.
- **Least privilege:** OAuth scopes are kept minimal (e.g. Shopify read scopes);
  WooCommerce credentials are per-store and encrypted, requiring no global
  secret.
- **Tenant safety:** structural `workspaceId` scoping plus service-boundary RBAC
  prevents cross-tenant access.
- **Safe errors:** the error taxonomy ensures users see friendly messages while
  internal details stay server-side.

---

## 10. Directory structure

```
tryavokado/
├── app/                          # Next.js App Router
│   ├── (marketing)/              # Public marketing site (SiteHeader/Footer layout)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (auth)/                   # Login / registration
│   │   ├── layout.tsx
│   │   ├── login/
│   │   └── register/
│   ├── (app)/                    # Authenticated dashboard
│   │   ├── layout.tsx
│   │   ├── overview/
│   │   ├── products/
│   │   ├── brand/
│   │   ├── strategy/
│   │   ├── creative/
│   │   ├── campaigns/
│   │   ├── recommendations/
│   │   ├── automations/
│   │   ├── analytics/
│   │   ├── integrations/
│   │   ├── assets/
│   │   └── settings/
│   ├── onboarding/               # First-run workspace setup
│   ├── api/
│   │   └── auth/[...all]/        # Better Auth route handler
│   ├── globals.css
│   └── layout.tsx                # Root layout
│
├── components/                   # UI building blocks
│   ├── ui/                       # shadcn-style primitives (button, card, …)
│   ├── marketing/                # Marketing-page components (Reveal, …)
│   ├── brand/                    # Logo / AvocadoMark
│   ├── app/                      # Dashboard components
│   ├── auth/                     # Auth forms
│   ├── onboarding/               # Onboarding components
│   └── providers.tsx
│
├── lib/                          # Application core
│   ├── db/                       # Data access (Drizzle)
│   │   ├── index.ts              # Client + connection
│   │   └── schema/               # Tables, enums, relations (snake_case, cuid2)
│   ├── auth/                     # Better Auth config + session/tenant resolution
│   │   ├── index.ts
│   │   ├── client.ts
│   │   └── session.ts            # getSession / requireUser / requireWorkspace
│   ├── workspace/                # Workspace domain service
│   │   ├── service.ts
│   │   ├── queries.ts
│   │   ├── actions.ts
│   │   └── progress.ts
│   ├── integrations/             # Typed adapters (Mock | Live per vendor)
│   ├── policy/                   # RBAC / authorization helpers
│   ├── security/                 # Headers, redaction, secret handling
│   ├── crypto/                   # AES-256-GCM token encryption
│   │   └── encryption.ts
│   ├── validations/              # Zod schemas (auth, workspace, …)
│   ├── email/                    # Transactional email (Resend)
│   ├── errors.ts                 # Standardized error taxonomy
│   ├── constants.ts              # App constants, roles, plans, platforms
│   ├── env.ts                    # Validated server environment
│   ├── env-public.ts             # Client-safe environment allow-list
│   ├── audit.ts                  # Audit helpers
│   └── utils.ts                  # cn, formatters, slugify, …
│
├── drizzle/                      # Generated SQL migrations + metadata
│   ├── 0000_*.sql
│   └── meta/
│
├── docs/                         # Project documentation
│   ├── architecture.md
│   └── local-development.md
│
├── scripts/                      # Tooling (db seed, …)
├── public/                       # Static assets
├── drizzle.config.ts             # Drizzle Kit config (snake_case, ./drizzle out)
├── next.config.ts
├── tsconfig.json                 # Strict TS, "@/*" path alias → repo root
└── package.json
```

> Note: some directories (e.g. `lib/integrations`, `lib/policy`,
> `lib/security`) are part of the intended layered architecture and may be
> filled in incrementally as features land; they are documented here so new code
> is placed in the right layer.

---

## 11. Where to add new code

| You are adding… | Put it in… |
| --- | --- |
| A new page or dashboard screen | `app/(app)/<feature>/` |
| A reusable visual component | `components/ui` or `components/<area>` |
| A business rule / use-case logic | `lib/<domain>` service |
| A call to a new external API | a new adapter in `lib/integrations/` |
| A new table or column | `lib/db/schema/*` → `npm run db:generate` |
| Long-running or scheduled work | an Inngest function |
| Input parsing | a Zod schema in `lib/validations/` |
| A new error condition | extend `lib/errors` |
