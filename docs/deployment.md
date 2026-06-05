# Deployment

How to deploy Avokado to a Node host or to Vercel. Avokado is a single Next.js 16
(App Router, React 19 RSC) application backed by PostgreSQL, with object storage,
durable background jobs, billing webhooks, and error monitoring.

Read `docs/security.md` first — several steps below exist to satisfy security
controls (encrypted tokens, no committed secrets, signed uploads, webhook
verification). The headline rule: **in production, secrets come from a managed
secret store, never from a `.env` file on the server.**

---

## 1. Prerequisites

- **Node 22.13.1** (pinned in `.nvmrc` / `.node-version`).
- A **managed PostgreSQL 16** database (see §3).
- **S3-compatible object storage** — Cloudflare R2 (see §5).
- An **Inngest** account (or self-hosted Inngest) for background jobs (see §6).
- A **Stripe** account for subscription billing (see §7).
- A **Sentry** project for error monitoring (see §8).
- Optional: a **Resend** account for transactional email, a **PostHog** project for
  product analytics, **Google Cloud** for Vertex AI and Google sign-in.

Avokado runs end-to-end in **mock mode** (`AVOKADO_MODE=mock`) with none of the
third-party credentials above. You can deploy a fully-functional demo first and
turn integrations live one at a time as credentials become available.

---

## 2. Environment variables

The authoritative list with comments is `.env.example`. Copy it, never commit the
filled-in version. The table below summarizes what each group is for and whether it
is required.

### Core (required)

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (use the pooled/SSL URL in prod). |
| `BETTER_AUTH_SECRET` | Signs auth sessions. Generate: `openssl rand -base64 32`. |
| `BETTER_AUTH_URL` | Auth base URL — your production origin. |
| `NEXT_PUBLIC_APP_URL` | Public base URL of the app (used in callbacks, emails). |
| `ENCRYPTION_KEY` | 32-byte base64 key for **AES-256-GCM** token encryption. Generate: `openssl rand -base64 32`. |
| `AVOKADO_MODE` | `mock` or `live`. In `live`, real adapters are used where credentials exist. |
| `NEXT_PUBLIC_AVOKADO_MODE` | Client-visible mirror of the mode (for labelling). |

### Google sign-in + Vertex AI

| Variable | Purpose |
| --- | --- |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth login. Callback: `{NEXT_PUBLIC_APP_URL}/api/auth/callback/google`. |
| `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION` | Vertex AI project/region. |
| `GOOGLE_GENAI_USE_VERTEXAI` | `true` to route generation through Vertex. |
| `GOOGLE_APPLICATION_CREDENTIALS` | **Local dev only** — path to a rotated, least-privilege SA JSON kept *outside* the repo. In production use ADC / Workload Identity (see §9). |
| `VERTEX_TEXT_MODEL`, `VERTEX_FAST_MODEL`, `VERTEX_VISION_MODEL` | Model identifiers. |

### Integrations

| Group | Variables |
| --- | --- |
| Shopify | `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET`, `SHOPIFY_SCOPES`, `SHOPIFY_APP_URL` |
| WooCommerce | *(none global — per-store keys are entered by the user and encrypted at rest)* |
| Meta | `META_APP_ID`, `META_APP_SECRET`, `META_GRAPH_API_VERSION`, `META_CONFIG_ID`, `META_MCP_ENABLED`, `META_MCP_URL` |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_GROWTH`, `STRIPE_PRICE_SCALE` |
| Object storage (R2) | `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_REGION`, `R2_ENDPOINT`, `R2_PUBLIC_URL` |
| Background jobs | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`, `INNGEST_DEV` |
| Email | `RESEND_API_KEY`, `EMAIL_FROM` |
| Monitoring | `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` |

**Production values:**

- Set `AVOKADO_MODE=live` (and `NEXT_PUBLIC_AVOKADO_MODE=live`) only once the
  credentials you need are present; integrations without credentials still fall
  back to mock.
- Set `INNGEST_DEV=false` in production.
- Set `SENTRY_ENVIRONMENT=production`.
- `NEXT_PUBLIC_*` variables are exposed to the browser — never put a secret behind a
  `NEXT_PUBLIC_` name.

---

## 3. PostgreSQL (managed)

Use a managed Postgres 16 provider (Neon, Supabase, RDS, Cloud SQL, etc.).

- Use the **pooled** connection string for the app runtime, and require TLS
  (`sslmode=require`) in production.
- Use a **separate, direct** connection (non-pooled) for migrations if your
  provider distinguishes them — migrations should not run over a transaction
  pooler.
- Create a **least-privilege** application database role. The migration role may
  need DDL rights; the runtime role needs only DML on the app schema. Both
  credentials are secrets delivered via the secret store.
- Enable automated backups / point-in-time recovery at the provider.

---

## 4. Running migrations on deploy

Avokado uses **Drizzle ORM** with SQL migrations checked into `drizzle/`.

- **Generate** migrations from schema changes locally: `npm run db:generate`
  (commit the generated SQL — it is part of the source).
- **Apply** migrations: `npm run db:migrate` (runs `drizzle-kit migrate`).

Run migrations as a **release/predeploy step that completes before traffic is
shifted to the new version**, not at request time:

- **Node host:** in your release phase — `npm run db:migrate && npm run start`
  (build separately, see §10), or run `db:migrate` as a dedicated job before the
  rollout.
- **Vercel:** migrations do not belong in the build step (the build can run before
  the database is reachable and runs in parallel across builds). Run
  `npm run db:migrate` from CI on the production branch *after* build and *before*
  promoting, or as a one-off deploy hook, gated so only one runner applies them.

Migrations are forward-only and idempotent (Drizzle tracks applied migrations).
Never use `db:push` against production — that is a dev convenience that bypasses
migration history.

---

## 5. Object storage (Cloudflare R2)

Creative assets live in R2 (S3-compatible) and are uploaded **direct-to-storage via
short-lived signed URLs** (see `docs/security.md` §8).

- Create a bucket (`R2_BUCKET`, default `avokado-assets`) and an **API token scoped
  to that bucket only**. Put the credentials (`R2_ACCESS_KEY_ID`,
  `R2_SECRET_ACCESS_KEY`, `R2_ACCOUNT_ID`, `R2_ENDPOINT`) in the secret store.
- Keep the bucket **private**. If you serve assets over a CDN, set `R2_PUBLIC_URL`
  to that controlled prefix; do not make the whole bucket world-readable.
- Configure **CORS** on the bucket to allow `PUT` from your app origin (signed
  uploads) and `GET` from where assets are displayed.
- `R2_REGION=auto` is correct for R2.

---

## 6. Inngest (background jobs)

Durable background jobs run on **Inngest** (see `docs/background-jobs.md` for the
full job catalog and semantics).

- The app exposes an Inngest endpoint at `/api/inngest` (the serve handler).
- Set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` from the Inngest dashboard;
  set `INNGEST_DEV=false` in production.
- After deploying, **register/sync** your app with Inngest so it discovers the
  functions at `/api/inngest` (via the Inngest dashboard's "Sync new app" or the
  sync URL for your environment). Re-sync whenever you add or rename a function.
- On Vercel, the Vercel↔Inngest integration can manage the signing/event keys and
  auto-sync on deploy.
- Inngest handles retries and backoff; ensure the functions remain reachable and
  the endpoint is not behind auth that would block Inngest's signed calls.

---

## 7. Stripe webhooks

Subscription billing uses Stripe with **signature-verified** webhooks (see
`docs/security.md` §11).

- Create products/prices and put their IDs in `STRIPE_PRICE_STARTER` /
  `STRIPE_PRICE_GROWTH` / `STRIPE_PRICE_SCALE` (matching the `PLANS` in
  `lib/constants.ts`).
- Add a webhook endpoint in Stripe pointing at
  `{NEXT_PUBLIC_APP_URL}/api/webhooks/stripe` and copy its signing secret into
  `STRIPE_WEBHOOK_SECRET`.
- The handler verifies the signature against the **raw request body** before acting,
  and is **idempotent on the Stripe event id** (duplicate deliveries are no-ops).
- Subscribe to at least: `checkout.session.completed`,
  `customer.subscription.created|updated|deleted`, `invoice.paid`,
  `invoice.payment_failed`.
- Use Stripe **test mode** keys in staging and live keys only in production.

---

## 8. Sentry (error monitoring)

- Set `SENTRY_DSN` (server) and `NEXT_PUBLIC_SENTRY_DSN` (client), plus
  `SENTRY_ENVIRONMENT=production`.
- Sentry is configured to **scrub secrets** in `beforeSend` (request bodies,
  headers, cookies) — see `docs/security.md` §12. Do not disable that.
- Upload source maps as part of the build for readable stack traces, and keep the
  maps private (do not serve them publicly).

PostHog (optional) is client-side product analytics via `NEXT_PUBLIC_POSTHOG_KEY` /
`NEXT_PUBLIC_POSTHOG_HOST`; it carries no secrets and can be omitted.

---

## 9. Secrets via a managed store (not `.env` in prod)

**Do not ship a `.env` file to production servers.** Deliver every secret as a
process environment variable sourced from a managed secret store:

- **Vercel:** Project → Settings → Environment Variables (mark them as
  Production/Preview/Development; mark sensitive ones as such). Vercel injects them
  at build/runtime — there is no `.env` on disk.
- **Node host / containers:** use your platform's secret manager (AWS Secrets
  Manager / SSM Parameter Store, Google Secret Manager, Doppler, Vault, Fly/Render
  secrets) and inject at runtime. Do not bake secrets into the image.
- **Google Cloud auth:** prefer **ADC via Workload Identity / Workload Identity
  Federation** so there is **no service-account key file** at all. Only fall back to
  a rotated least-privilege SA JSON outside the repo if unavoidable (see
  `docs/security.md` §4). **Any key that has ever been shared is compromised —
  rotate it.**
- Rotate `ENCRYPTION_KEY`, `BETTER_AUTH_SECRET`, database, and provider credentials
  on a schedule and immediately on suspected exposure. `ENCRYPTION_KEY` rotation
  requires re-encrypting stored tokens (keep the old key available during
  migration).
- `*.env`, service-account JSON, `*.key`, and `*.pem` are git-ignored as a backstop
  (see `docs/security.md` §2) — but the real control is never putting them on a
  server in the first place.

---

## 10. Build and run

```bash
# Use the pinned Node version
nvm use                 # 22.13.1

# Install (CI: prefer `npm ci` against the committed lockfile)
npm ci

# Quality gate (recommended in CI before deploy)
npm run check           # typecheck + lint + unit tests

# Build
npm run build

# Apply DB migrations (release step, before traffic shift)
npm run db:migrate

# Start (Node host)
npm run start           # serves the production build
```

On **Vercel**, the build is `next build` automatically; you provide env vars in the
dashboard (§9), run `db:migrate` from CI/deploy hook (§4), and connect the Inngest
and Stripe integrations.

---

## 11. Production checklist

**Secrets & config**

- [ ] All required env vars set in the **managed secret store**; no `.env` on the
      server.
- [ ] `ENCRYPTION_KEY` and `BETTER_AUTH_SECRET` are unique 32-byte values, not
      copied from any example or another environment.
- [ ] No `NEXT_PUBLIC_` variable holds a secret.
- [ ] Google auth uses ADC / Workload Identity; **no SA private key committed**; any
      previously-shared key has been **rotated**.

**Database**

- [ ] Managed Postgres reachable over TLS; pooled URL for runtime, direct URL for
      migrations.
- [ ] `npm run db:migrate` runs as a release step and succeeds before traffic shift.
- [ ] `db:push` is **not** used against production.
- [ ] Automated backups / PITR enabled.

**Storage & jobs**

- [ ] R2 bucket private, token scoped to the bucket, CORS allows signed `PUT` from
      the app origin.
- [ ] Inngest keys set, `INNGEST_DEV=false`, app **synced** so functions are
      registered.

**Billing & monitoring**

- [ ] Stripe live keys set; webhook endpoint added with `STRIPE_WEBHOOK_SECRET`;
      signature verification and event-id idempotency confirmed.
- [ ] Stripe price IDs match `PLANS`.
- [ ] Sentry DSNs set, `SENTRY_ENVIRONMENT=production`, secret scrubbing on, source
      maps uploaded (and kept private).

**App**

- [ ] `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` point at the production origin; OAuth
      callbacks registered for that origin.
- [ ] HTTPS/TLS enforced end-to-end; session cookies `Secure`; HSTS at the edge.
- [ ] Rate limiting backed by a shared store if running multiple instances.
- [ ] `AVOKADO_MODE=live` only for integrations that have real credentials;
      everything else cleanly falls back to mock.
- [ ] `npm run check` green in CI; smoke-test login, store connect (or mock), a
      background job, and a Stripe test webhook after deploy.
