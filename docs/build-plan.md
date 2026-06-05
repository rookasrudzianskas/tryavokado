# Avokado — Build Plan

> Living document. Tracks repository state, decisions, and phase progress for the
> Avokado ecommerce advertising automation platform.

## 1. Repository inspection (starting state)

The target directory `/Users/rokasrudzianskas/Desktop/tryavokado` was **empty** and
not a git repository. There was no prior code to reconcile, so there are **no
conflicts** with this specification. (The unrelated `katchy` macOS project lives in
a separate directory and is not touched.)

Environment provisioned for development:

- **Node 22.13.1** (via nvm) — satisfies every dependency engine requirement.
- **PostgreSQL 16** (Homebrew) running locally, databases `avokado_dev` and
  `avokado_test` created.
- npm 10 as the package manager (single-repo, not a monorepo).

## 2. Key architectural decisions

| Area | Decision | Rationale |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) + React 19 RSC | Spec requirement; latest stable. |
| Styling | Tailwind v4 + custom shadcn-style primitives | Full control of a non-generic design system. |
| Design language | Warm light palette, avocado accent (OKLCH), Fraunces display serif + Geist | "Premium creative OS", not a generic dashboard. |
| DB / ORM | PostgreSQL + Drizzle ORM (snake_case), cuid2 ids | Type-safe schema + migrations; spec requirement. |
| Auth | Better Auth (email/password + Google) | Production-ready, multi-tenant friendly. |
| Validation | Zod 4 everywhere (env, forms, model output) | Runtime safety; structured AI output. |
| Secrets | AES-256-GCM token encryption; `.env` never committed | Hard security requirement. |
| Mode | `AVOKADO_MODE=mock` with per-integration auto-fallback | Entire product usable with zero external credentials. |
| Integrations | Typed adapter interfaces + Mock/Live adapters | App never depends on a concrete Meta/Shopify/etc. impl. |
| Background jobs | Inngest (durable, idempotent) | Spec requirement. |
| Storage | S3-compatible (Cloudflare R2) signed uploads | Direct-to-storage, resumable video. |

## 3. Security posture (non-negotiable)

- No previously-shared Google/Firebase key is used, read, or committed. Only
  environment-variable placeholders exist. Production auth uses ADC / Workload
  Identity / a managed secret store / a freshly-rotated least-privilege SA.
- `.env`, `.env.local`, service-account JSON, `*.key`, `*.pem` are gitignored.
- Third-party tokens are encrypted at rest and never sent to the browser or logs.
- SSRF protection, URL validation, signed uploads, CSRF, rate limiting, webhook
  signature verification, audit logging.

## 4. Phase status

- [x] **Phase 1 — Foundation** *(in progress, core complete & verified running)*
  - [x] Project scaffold, TypeScript strict, Tailwind v4, ESLint/Prettier
  - [x] Env validation + `.env.example` + startup checks + secret utilities
  - [x] Full Drizzle schema (49 tables) + migration applied to Postgres
  - [x] Design system tokens + core UI primitives (~20 components)
  - [x] Better Auth (email/password + Google) wired to Drizzle
  - [x] Workspace multi-tenancy + RBAC helpers + audit log
  - [x] Standardized error taxonomy
  - [x] Marketing site shell + premium homepage (verified rendering)
  - [ ] Auth pages (login / register), onboarding wizard, app shell
  - [ ] Mock-mode adapters + policy engine + testing foundation
- [ ] **Phase 2 — Onboarding & store connections** (Shopify / WooCommerce / website)
- [ ] **Phase 3 — Brand intelligence** (Vertex adapter, brand book, PDF, versions)
- [ ] **Phase 4 — Products & assets** (catalog, library, uploads, analysis)
- [ ] **Phase 5 — Strategy & creative studio**
- [ ] **Phase 6 — Meta connection & campaign drafts**
- [ ] **Phase 7 — Analytics & recommendations**
- [ ] **Phase 8 — Automations, billing, hardening**

## 5. What is real vs. mocked (kept current)

| Capability | Status |
| --- | --- |
| Auth, workspaces, RBAC, audit | Real (Postgres) |
| Database schema & migrations | Real |
| Design system & marketing site | Real |
| Shopify / WooCommerce / Meta / Vertex | Typed adapters + **mock** adapters (real adapters are skeletoned and gated on credentials + provider approval) |
| Object storage / Stripe / Resend / Sentry / PostHog | Wired, gated on env credentials; mock/no-op in dev |

See `docs/mock-mode.md` and the per-integration setup docs for exactly what each
integration requires before it can run live.
