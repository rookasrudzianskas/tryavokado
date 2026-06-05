# Meta setup (Facebook & Instagram Marketing API)

> How Avokado connects to Meta, what it reads and (with explicit approval) writes,
> and the safety rules that govern every mutation. Avokado is **draft-first and
> approval-required** — it never silently spends money, launches a campaign, or
> touches a payment method.

Avokado talks to Meta only through a single typed interface, `MetaAdapter`. The
rest of the application — onboarding, campaign drafts, the policy engine,
analytics, automations — depends on that interface and **never** on a concrete
Meta SDK or HTTP client. Three implementations satisfy it:

| Adapter | What it is | When it runs |
| --- | --- | --- |
| `MetaMarketingApiAdapter` | The official Graph **Marketing API** over HTTPS. The production source of truth for reads and **all** mutations. | `AVOKADO_MODE=live` and a connected workspace with valid credentials. |
| `MetaMcpAdapter` | An **optional**, agent-facing connector that speaks to a [Meta Ads MCP](./meta-mcp-vs-marketing-api.md) server. Convenience for conversational, exploratory flows. | Only when `META_MCP_ENABLED=true` **and** `META_MCP_URL` is set. Off by default. |
| `MockMetaAdapter` | A fully labelled, in-memory fake. Returns realistic businesses, ad accounts, pages, pixels, and catalogs with `isMock: true`. | `AVOKADO_MODE=mock`, or `live` when Meta credentials are absent (auto-fallback). |

Because every selector and mutation has the same typed signature, switching
adapters is a configuration change, not a code change. The selected adapter for a
workspace is recorded in `meta_connections.adapter` (`"marketing_api"`, `"mcp"`,
or `"mock"`) and surfaced in the UI so operators always know whether they are
looking at real data.

> **Read this first:** for *why* production mutations go through
> `MetaMarketingApiAdapter` and the policy engine rather than MCP, see
> [`meta-mcp-vs-marketing-api.md`](./meta-mcp-vs-marketing-api.md).

---

## 1. Create a Meta app

You need a Meta app to obtain an App ID/Secret and to request advertising
permissions. This is a one-time setup per Avokado deployment, not per customer.

1. Sign in to the [Meta for Developers](https://developers.facebook.com/) portal
   with an account that can administer your organisation's Business Portfolio.
2. **Create App** → choose the **Business** app type. Associate it with your
   Business Portfolio when prompted.
3. Add the products this integration uses:
   - **Marketing API** — campaign, ad set, ad, and insights endpoints.
   - **Facebook Login for Business** — the OAuth flow used to obtain a per-user
     long-lived token with a fixed configuration (see [§3](#3-oauth--permissions)).
4. Under **App settings → Basic**, note the **App ID** and **App Secret**, and add
   your domain and privacy-policy / data-deletion URLs. The App Secret is a
   server-only secret — it is set as `META_APP_SECRET` and is **never** shipped to
   the browser.
5. Configure **Valid OAuth Redirect URIs** to include:
   ```
   {NEXT_PUBLIC_APP_URL}/api/integrations/meta/callback
   ```
   (for local development, `http://localhost:3000/api/integrations/meta/callback`).

> **App Review required.** A freshly-created app can only act on behalf of people
> with a role on the app itself (admins, developers, testers) in **development
> mode**. To serve real customers you must submit the advertising permissions for
> **App Review** and have the app in **Live** mode. See
> [§9 — What requires review](#9-what-requires-app-review--business-verification).

---

## 2. Business verification

Meta requires **Business Verification** of your Business Portfolio before it will
grant advanced access to the advertising permissions in production. Verification
confirms your legal entity (business name, address, and a verifiable phone number,
website, or document).

- Start it in the **Business Settings → Business Info → Security Center** (or the
  **App Review** flow will link you to it).
- Until verification and App Review complete, the app works against **mock data**
  and against accounts owned by app roles in development mode — which is enough to
  build and demo the entire Avokado flow end to end.
- Verification is about *your* business (the Avokado operator). Each **customer**
  separately grants Avokado access to *their* assets via OAuth; customers do not
  need to verify your app.

---

## 3. OAuth & permissions

Avokado uses **Facebook Login for Business** with a saved **configuration**
(`META_CONFIG_ID`). A configuration pins the exact set of permissions and the
token type (long-lived user access token) so the consent screen is consistent and
auditable, and so we cannot accidentally request more than we need.

### Permissions (scopes) requested

| Scope | Why Avokado needs it | Access |
| --- | --- | --- |
| `ads_read` | Read campaigns, ad sets, ads, and insights for reporting and recommendations. | Advanced (review) |
| `ads_management` | Create **paused** campaigns/ad sets/ads and, on explicit approval, activate, pause, or change budgets. | Advanced (review) |
| `business_management` | Enumerate the Business Portfolio, owned ad accounts, pages, and product catalogs the user has granted. | Advanced (review) |
| `pages_show_list` / `pages_read_engagement` | List the Pages the user manages and read the metadata needed to attach a Page to an ad. | Advanced (review) |
| `instagram_basic` | Discover the Instagram professional account linked to a selected Page for Instagram placements. | Advanced (review) |
| `catalog_management` | Read product catalogs for Advantage+ catalog / dynamic product ads (read-first; Avokado does not rewrite a customer's catalog). | Advanced (review) |

> Avokado follows **least privilege**: it requests read-oriented scopes by default
> and only the write scope (`ads_management`) needed for draft creation and
> approved changes. We never request scopes the product does not use (no
> `publish_to_groups`, no messaging scopes, etc.).

### The connect flow

1. The user clicks **Connect Meta** in workspace settings.
2. Avokado redirects to Meta's Login for Business dialog using `META_APP_ID` and
   `META_CONFIG_ID`, with a signed, single-use `state` value (CSRF protection).
3. The user picks which Business, ad accounts, Pages, Instagram accounts, and
   catalogs to share, then consents to the listed permissions.
4. Meta redirects back to `/api/integrations/meta/callback`. Avokado validates
   `state`, exchanges the `code` for a token, then **exchanges it for a long-lived
   token** and records the **granted** scopes (which may be a subset of requested).
5. The token is encrypted and stored; readiness checks run; the user is taken to
   the selection step.

If the user declines a scope, Avokado degrades gracefully: it stores the granted
scopes in `meta_connections.granted_scopes` and the readiness checks
([§5](#5-readiness-checks)) report exactly which capability is missing rather than
failing opaquely.

---

## 4. Environment variables

All Meta configuration lives in environment variables (see `.env.example`). Only
two are secrets; the rest are non-sensitive configuration.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `META_APP_ID` | Yes (for live) | — | App ID from Meta for Developers. Identifies the OAuth client. Safe to expose. |
| `META_APP_SECRET` | Yes (for live) | — | **Secret.** Server-only; used to verify `appsecret_proof` and exchange tokens. Never sent to the client or logs. |
| `META_GRAPH_API_VERSION` | No | `v23.0` | Pinned Graph API version. Pin it explicitly so a Meta-side default change cannot silently alter behaviour; bump deliberately. |
| `META_CONFIG_ID` | Yes (for live) | — | Facebook Login **for Business** configuration ID that fixes the requested scopes and token type. |
| `META_MCP_ENABLED` | No | `false` | Feature flag for the optional `MetaMcpAdapter`. **Defaults to `false`.** Mutations stay on the Marketing API regardless. |
| `META_MCP_URL` | No | — | Endpoint of the Meta Ads MCP server. Required only when `META_MCP_ENABLED=true`. |

Resolution rules:

- **No `META_APP_ID` / `META_APP_SECRET`** → the Meta integration auto-falls back
  to `MockMetaAdapter`, even in `AVOKADO_MODE=live`. The product stays fully
  usable; everything is labelled mock.
- **`META_MCP_ENABLED` unset or not exactly `"true"`** → `MetaMcpAdapter` is never
  constructed. The string is compared exactly (`env.META_MCP_ENABLED === "true"`).
- `META_GRAPH_API_VERSION` is validated and defaults to `v23.0` if absent so a
  version is always present in request URLs.

---

## 5. Readiness checks

Before Avokado will let a user move a campaign draft toward launch, it runs a set
of **readiness checks** against the selected connection and stores the latest run
on `meta_connections` (`last_checked_at`, `last_error`) and per-entity rows
(`meta_ad_accounts`, `meta_pages`, etc.). Each check is independently
pass / warn / fail with a plain-language remedy and a deep link into Meta.

| # | Check | What "ready" means | Where it reads |
| --- | --- | --- | --- |
| 1 | **Business** | A Business Portfolio is selected and accessible. | `meta_businesses.selected_business_id` |
| 2 | **Ad account** | An ad account is selected and `account_status` is active (not `DISABLED`, `UNSETTLED`, `PENDING_CLOSURE`, etc.). | `meta_ad_accounts.account_status`, `disable_reason` |
| 3 | **Page** | A Facebook Page is selected and grants the needed roles. | `meta_pages` |
| 4 | **Instagram** | An Instagram professional account is linked to the selected Page (required only for Instagram placements). | `meta_instagram_accounts` |
| 5 | **Pixel / dataset** | A pixel (dataset) is selected and has fired recently enough to optimise for conversions. | `meta_pixels.last_fired_at` |
| 6 | **Catalog** | A product catalog is selected (required only for catalog / dynamic product ads). | `meta_catalogs` |
| 7 | **Permissions** | All scopes the planned actions need are present in the granted set. | `meta_connections.granted_scopes` |
| 8 | **Currency** | The ad account currency is known and matches what the draft's budgets are expressed in. | `meta_ad_accounts.currency` |
| 9 | **Timezone** | The ad account timezone is known (it governs daily-budget reset and scheduling). | `meta_ad_accounts.timezone` |
| 10 | **Account restrictions** | No disabled status, integrity/policy hold, or feature-level restriction blocks creating or running ads. | `meta_ad_accounts.account_status`, `disable_reason` |
| 11 | **Billing readiness** | The ad account has a usable, non-restricted funding source. | `meta_ad_accounts.funding_ready` |

Checks are **advisory and blocking by tier**: missing Instagram or catalog only
matters if the draft targets Instagram placements or uses a catalog, so those
warn. Items that would make a launch fail or spend incorrectly — a disabled
account, missing currency/timezone, an absent write scope, or no funding source —
**block** the activation step until resolved.

> **Billing is never automated.** Check 11 only *reports* readiness. Avokado does
> not add, edit, or charge a payment method (see
> [§7 — Draft-first policy](#7-draft-first-creation-policy)).

---

## 6. Token encryption

Meta tokens are sensitive credentials and are treated as such everywhere.

- The long-lived user access token is encrypted with **AES-256-GCM** using
  `ENCRYPTION_KEY` and stored in `meta_connections.encrypted_token`. The plaintext
  token is never persisted.
- Encrypted tokens are **never** returned to the browser, included in API
  responses, or written to logs, traces, or error reports. Logs reference the
  `meta_connections.id`, not the secret.
- Every outbound Marketing API call includes an `appsecret_proof` (an HMAC of the
  token keyed by `META_APP_SECRET`) so a leaked token cannot be replayed without
  the server secret.
- `granted_scopes` and `token_expires_at` are stored so Avokado can detect an
  expiring or under-scoped token and prompt a reconnect **before** an action fails.
- On disconnect, the encrypted token is deleted and the connection's child rows
  (businesses, ad accounts, pages, etc.) are removed via cascade.
- Rotating `ENCRYPTION_KEY` follows the standard envelope-rotation procedure in
  [`docs/security.md`](./security.md); tokens are re-encrypted, not exposed.

---

## 7. DRAFT-FIRST creation policy

This is the core safety contract of the Meta integration. **Avokado is built so
that money cannot move and ads cannot run without an explicit human decision.**

### Everything is created paused

- When an approved campaign draft (`campaign_drafts`) is materialised into Meta,
  the campaign, **every** ad set, and **every** ad are created with
  `status = PAUSED`. Locally these rows default to `status: "paused"` in
  `campaigns`, `ad_sets`, and `ads`.
- Creating the draft objects is intentionally separate from running them. A user
  reviews the real, Meta-created (but paused) structure before anything serves.

### Activation requires explicit approval

- Moving a campaign, ad set, or ad from `PAUSED` to `ACTIVE` is a distinct,
  privileged action that records an entry in the `approvals` table
  (`kind = "activate"`) with the requesting and deciding user, a timestamp, and the
  exact payload. The same applies to **budget changes** and pauses.
- The **policy engine** sits between the app and `MetaMarketingApiAdapter` and
  vetoes anything outside the rails in `SAFETY_LIMITS` — e.g. a single budget
  increase above the allowed percentage, or a performance-based pause before the
  minimum spend / impressions / conversions thresholds are met. A blocked action
  is recorded with its `blocked_reason` and never silently dropped.

### Idempotency and audit

- Every mutating call carries an **idempotency key**. Jobs are persisted in
  `integration_jobs` with a **unique** `idempotency_key`, so a retry, a
  double-click, or a re-queued background job cannot create duplicate campaigns or
  double-apply a budget change. Re-running a key returns the original result.
- Every create / activate / pause / budget change writes to the **audit log**
  (`lib/audit.ts`) with the actor, workspace, entity, before/after, and the
  idempotency key — a complete, queryable history of who changed what and when.
- Background materialisation runs through Inngest (durable, retried, idempotent);
  see [`docs/background-jobs.md`](./background-jobs.md).

### Billing is hands-off, always

- Avokado **never** adds, edits, removes, or charges a **payment card** or any
  funding instrument, and never raises spending limits on the user's behalf.
- When billing readiness ([§5](#5-readiness-checks), check 11) fails, Avokado
  **guides the user to complete billing in Meta** with a deep link to the ad
  account's Payment Settings and a short checklist — it does not attempt the change
  itself. Spend authority stays entirely with the account owner inside Meta.

### Why mutations go through the typed Marketing API adapter

All production mutations (create, update, pause, budget change) go through
`MetaMarketingApiAdapter` + the policy engine — never through MCP — because that
path is typed end to end, idempotent, auditable, and bounded by `SAFETY_LIMITS`.
`MetaMcpAdapter` is an optional agent-facing convenience and is gated behind
`META_MCP_ENABLED` (default `false`). The full rationale is in
[`meta-mcp-vs-marketing-api.md`](./meta-mcp-vs-marketing-api.md).

---

## 8. Mock mode (no Meta credentials needed)

With `AVOKADO_MODE=mock` (or `live` without `META_APP_ID` / `META_APP_SECRET`),
`MockMetaAdapter` serves the entire flow: it returns deterministic businesses, ad
accounts (with currency, timezone, and `funding_ready`), Pages, Instagram
accounts, pixels, and catalogs, and it "creates" campaigns/ad sets/ads as paused
mock rows (`is_mock: true`). Readiness checks, the draft-first flow, approvals,
idempotency, and the audit log all run identically — only the network boundary is
faked. This lets the product be developed, demoed, and tested with **zero** Meta
setup. See [`docs/mock-mode.md`](./mock-mode.md).

---

## 9. What requires App Review / Business Verification

A blunt summary of the gates between "works in development" and "serves
customers":

| Requirement | Gated capability |
| --- | --- |
| **App in Live mode** | Acting on behalf of anyone who is **not** an admin/developer/tester of the app. |
| **Business Verification** (your Business Portfolio) | Advanced access to the advertising permissions in production. |
| **App Review** of `ads_management`, `ads_read`, `business_management` | Reading and writing ads for customers who are not app roles. |
| **App Review** of `pages_show_list`, `pages_read_engagement` | Listing and attaching customer Pages. |
| **App Review** of `instagram_basic` | Discovering a customer's Instagram account for placements. |
| **App Review** of `catalog_management` | Reading customer catalogs for dynamic product ads. |

**Not** gated (works immediately):

- The entire product against `MockMetaAdapter` (no Meta app at all).
- Real Marketing API calls in **development mode** for ad accounts/pages owned by
  people who hold a **role on your app** — ideal for staging and your own demo
  assets.

Plan App Review and Business Verification well ahead of onboarding external
customers, as both involve a Meta-side review queue. Until they complete, keep
external workspaces on mock and your own assets in development mode.

---

## Related docs

- [`meta-mcp-vs-marketing-api.md`](./meta-mcp-vs-marketing-api.md) — adapter
  comparison and why mutations use the typed Marketing API path.
- [`security.md`](./security.md) — token encryption, key rotation, SSRF, audit.
- [`mock-mode.md`](./mock-mode.md) — how mock adapters and auto-fallback work.
- [`background-jobs.md`](./background-jobs.md) — durable, idempotent job execution.
