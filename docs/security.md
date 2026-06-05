# Security Model

This document describes how Avokado protects credentials, customer data, and the
actions it takes on a brand's behalf. It is written to be honest about what is
implemented and what is operational discipline. **It makes no certification or
compliance claims** (no SOC 2, ISO 27001, PCI, HIPAA, or GDPR "compliance"
assertions). Where a control depends on how you deploy and operate the app, that
is stated plainly.

If you find a vulnerability, see [Responsible disclosure](#responsible-disclosure)
at the end — please do not open a public issue.

---

## 1. Threat model in one paragraph

Avokado is a multi-tenant SaaS that holds long-lived third-party credentials
(Meta, Shopify, WooCommerce, Google), can read a brand's store and website, can
spend ad budget, and stores creative assets. The assets we most need to protect
are: (a) stored third-party tokens, (b) workspace data isolation between tenants,
and (c) the integrity of money-spending actions. The most likely attack surfaces
are credential leakage (committed secrets, logs), server-side request forgery via
the website-inspection feature, cross-tenant data access via missing authorization
checks, and forged callbacks (OAuth, Stripe/Meta webhooks). Every control below
maps back to one of those.

---

## 2. Secret handling and `.env` hygiene

**Never commit secrets.** The following are git-ignored and must never be
committed, in any branch, ever:

- `.env`, `.env.local`, and every `.env.*` variant (the single allowed exception is
  the placeholder-only `.env.example`).
- Service-account JSON (`*service-account*.json`, `*serviceaccount*.json`,
  `*-key.json`, `gha-creds-*.json`).
- Private keys and certificates (`*.pem`, `*.key`).
- The `/secrets/` and `/.secrets/` directories.

These patterns live in `.gitignore`. They are a backstop, not the primary control.
The primary control is discipline: **secrets are provided to the running process
as environment variables from a managed secret store**, not from a file checked
into source. See `docs/deployment.md` for production secret delivery.

**`.env.example` is the contract.** It lists every variable with an empty value
or an obvious placeholder and a comment. It contains no real secret. When you add
a new credential, add it to `.env.example` with a comment, never the real value.

**Local development.** Copy `.env.example` to `.env.local` and fill in real values
locally. Avokado runs fully in **mock mode** (`AVOKADO_MODE=mock`) with zero
third-party credentials — every integration falls back to a clearly-labelled mock
adapter when its credentials are absent — so most development never needs a real
secret on disk at all.

**If a secret is ever exposed, rotate it.** A secret that appeared in a commit, a
log, a screenshot, a chat message, or a shared file is compromised the moment it
leaves a trusted boundary, even if the commit is later reverted or force-pushed.
Reverting does not un-leak it. Rotate the credential at the provider, then update
the secret store. This applies with particular force to Google service-account
keys — see §4.

---

## 3. Token encryption at rest

All third-party tokens and per-store credentials that Avokado must store (Meta
access tokens, Shopify offline tokens, WooCommerce consumer key/secret, etc.) are
**encrypted at rest with AES-256-GCM** before they touch the database.

- The key is the 32-byte `ENCRYPTION_KEY` (base64), generated with
  `openssl rand -base64 32`. It is supplied as an environment variable and is
  **never** committed.
- AES-256-GCM is authenticated encryption: each ciphertext carries a random IV
  (nonce) and an authentication tag, so tampering with stored ciphertext fails
  decryption rather than silently returning corrupted plaintext.
- A fresh random IV is generated per encryption operation; IVs are never reused
  with the same key.
- Encrypted values are stored as opaque blobs. The plaintext token exists only in
  process memory for the duration of an outbound API call.
- **Decrypted tokens are never sent to the browser and never written to logs.**
  Server Components and route handlers use tokens server-side only; the client
  receives derived, non-sensitive state (e.g. "Meta: connected").

**Key rotation.** Treat `ENCRYPTION_KEY` as rotatable. The supported path is
envelope-style re-encryption: keep the previous key available long enough to
decrypt existing rows, re-encrypt them under the new key, then retire the old key.
Plan for this before you need it; do not hard-code a single immortal key.

---

## 4. Google Cloud authentication (no committed private keys)

Avokado uses Google Vertex AI for brand intelligence and structured generation,
and Google OAuth for sign-in. **No Google private key is committed to this
repository, and none ever should be.**

Production authentication to Google Cloud uses, in order of preference:

1. **Application Default Credentials (ADC) via Workload Identity** — when running
   on GKE, Cloud Run, or another Google-managed runtime, the workload assumes a
   service-account identity automatically. No key file exists.
2. **Workload Identity Federation** — when running off Google (e.g. a Node host or
   Vercel), federate from the host's own OIDC identity to a Google service
   account, again with **no downloadable key**.
3. **A managed secret store** — if a short-lived credential is genuinely required,
   fetch it at runtime from your platform's secret manager (Google Secret Manager,
   Vercel/host secret store), never from a file in the repo.
4. **A rotated, least-privilege service-account JSON** — only as a last resort and
   only outside the repo. `GOOGLE_APPLICATION_CREDENTIALS` may point at such a file
   for local development. The service account must hold the **minimum** roles
   needed (e.g. Vertex AI User), be rotated on a schedule, and the JSON must live
   **outside** the working tree and be covered by the ignore patterns in §2.

> **A previously-shared key is compromised.** If any Google/Firebase
> service-account key, OAuth client secret, or API key has ever been pasted into a
> document, commit, message, or screenshot, treat it as compromised. **Disable and
> delete that key in the Google Cloud console and issue a fresh least-privilege
> credential.** Do not reuse it. Reverting the place it appeared does not make it
> safe.

OAuth login uses `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` configured purely as
environment variables; the callback is restricted to
`{NEXT_PUBLIC_APP_URL}/api/auth/callback/google`.

---

## 5. SSRF protection and URL validation (website inspection)

Avokado inspects brand websites (to learn the brand and capture screenshots). Any
feature that fetches a **user-supplied URL** is an SSRF risk: an attacker could
point it at internal services, cloud metadata endpoints, or the loopback address.

Avokado validates every outbound URL **before** the request and re-validates on
redirect:

- **Scheme allow-list:** only `http` and `https`. No `file:`, `ftp:`, `gopher:`,
  `data:`, etc.
- **DNS resolution then IP checks:** resolve the hostname and reject if it maps to
  a private, loopback, link-local, or reserved range (RFC 1918 `10/8`,
  `172.16/12`, `192.168/16`; loopback `127/8`, `::1`; link-local `169.254/16`
  including the `169.254.169.254` cloud-metadata address; ULA `fc00::/7`;
  unspecified/multicast/reserved). IP parsing uses `ipaddr.js`.
- **No raw-IP hosts** where a public hostname is expected, and IPv4-mapped IPv6
  forms are normalized before the check so they cannot bypass it.
- **Redirect re-validation:** redirects are followed manually and the destination
  is validated again with the same rules — the first hop being public does not
  make a later hop safe. The redirect chain is bounded.
- **Bounded fetch:** request timeouts, a maximum response size, and a capped
  content type so a malicious site cannot exhaust the worker. `robots.txt` is
  honored via `robots-parser` for crawling-style fetches.
- **No credential forwarding:** outbound inspection requests carry no Avokado
  cookies, tokens, or internal headers.

The same validation guards any other place a URL is fetched on the server.

---

## 6. CSRF protection

State-changing requests are protected against cross-site request forgery:

- Authentication is handled by Better Auth with same-site session cookies marked
  `HttpOnly`, `Secure` (in production), and `SameSite=Lax`, which blocks the
  classic cross-site form-POST vector.
- Mutations go through server actions / route handlers that verify the session and
  the request origin; cross-origin requests without a valid same-site session are
  rejected.
- Webhook endpoints (which are intentionally cross-origin) do **not** rely on
  cookies and are instead authenticated by signature verification (§9), so they
  are not subject to — and do not weaken — the CSRF posture.

---

## 7. Rate limiting

Sensitive and abusable endpoints are rate-limited to blunt brute force, scraping,
and resource-exhaustion:

- Authentication (login, register, password reset), OAuth callbacks, and the
  website-inspection trigger are limited per IP and per account.
- Expensive AI and inspection work is additionally bounded **per workspace** so one
  tenant cannot starve others, with in-process concurrency caps (`p-limit`) around
  fan-out.
- Limits are applied at the edge/middleware layer and enforced again at the action
  layer. In a horizontally-scaled deployment, back the limiter with a shared store
  (e.g. your managed Redis) so limits are global rather than per-instance.

Rate-limit responses use `429` and do not leak whether an account exists.

---

## 8. Signed uploads and object storage

Creative assets (images, video) are stored in S3-compatible object storage
(Cloudflare R2). Uploads are **direct-to-storage with short-lived signed URLs**:

- The browser never receives long-lived storage credentials. The server issues a
  **pre-signed PUT URL** (via `@aws-sdk/s3-request-presigner`) scoped to a single
  object key, a content type, a size limit, and a short expiry.
- Object keys are namespaced by workspace, and a request to sign an upload is
  authorized against the caller's workspace membership and role first.
- The bucket is private by default. Read access is served through signed GET URLs
  or an explicit, controlled public-CDN prefix (`R2_PUBLIC_URL`) — never by making
  the whole bucket world-readable.
- Uploaded content type and size are validated; downstream analysis treats asset
  bytes as untrusted input.

---

## 9. RBAC and workspace scoping

Avokado is multi-tenant. **Every data access is scoped to a workspace, and every
action is authorized by role.** This is the single most important control against
cross-tenant data exposure.

- **Workspace scoping:** all tenant tables carry a `workspace_id` and queries are
  always filtered by the caller's active workspace. There is no query path that
  returns another workspace's rows. Foreign keys cascade on workspace deletion.
- **Roles** (most → least privileged): `owner`, `admin`, `marketer`, `analyst`,
  `viewer` (see `lib/constants.ts`). Capability checks use a rank comparison
  (`roleAtLeast`) so higher roles inherit lower-role capabilities.
  - `owner` — full control incl. billing and workspace deletion.
  - `admin` — manage members, integrations, all campaign actions.
  - `marketer` — build and approve creative, strategy, and campaign **drafts**.
  - `analyst` — view analytics and propose recommendations.
  - `viewer` — read-only.
- **Authorization is server-side and deny-by-default.** Membership and role are
  resolved from the database on every privileged request; the client-reported role
  is never trusted. UI hiding is a convenience, not a control.
- **Draft-first / approval-required:** money-spending or externally-visible actions
  (publishing a campaign, raising a budget) are created as drafts and require an
  explicit approval step. The policy engine applies hard safety rails regardless of
  user settings (e.g. never raise a budget more than 20% in one action — see
  `SAFETY_LIMITS`). This limits the blast radius of both bugs and compromised
  lower-privilege accounts.

---

## 10. OAuth state validation

OAuth flows (Google sign-in, Meta/Shopify connection) validate the `state`
parameter to prevent CSRF and authorization-code injection:

- A cryptographically-random, single-use `state` is generated, bound to the user's
  session, and stored server-side (or in a signed, short-lived cookie) before the
  redirect to the provider.
- On callback, the returned `state` must match the stored value exactly; mismatched,
  missing, reused, or expired `state` is rejected and the flow aborts.
- The `redirect_uri` is fixed to a registered Avokado callback and validated; only
  configured callbacks are accepted.
- Authorization codes are exchanged server-side; resulting tokens are encrypted at
  rest (§3) and never exposed to the browser.

---

## 11. Webhook signature verification

Inbound webhooks are authenticated by signature, not by trust in the network:

- **Stripe:** every webhook is verified with `STRIPE_WEBHOOK_SECRET` using the
  Stripe SDK against the **raw request body** (the signature is computed over raw
  bytes; the body is read raw, not after JSON parsing). Invalid signatures are
  rejected with `400` before any side effect. Replays are bounded by Stripe's
  timestamp tolerance, and handlers are idempotent on the Stripe event id.
- **Meta:** webhook payloads are verified using the app secret
  (`X-Hub-Signature-256`, HMAC-SHA256 over the raw body) and the verify-token
  handshake on subscription.
- Verification happens **before** parsing or acting on the payload, and signature
  comparison is constant-time.

---

## 12. Secret redaction in logs

Logs must never become a secret store:

- A redaction layer scrubs known-sensitive keys (anything matching `token`,
  `secret`, `password`, `authorization`, `api_key`, `cookie`, `set-cookie`,
  `client_secret`, `ENCRYPTION_KEY`, connection strings, etc.) and replaces the
  value with `[redacted]` before anything is written.
- Decrypted third-party tokens, the encryption key, and full request/response
  bodies for integration calls are **never** logged. Error reporting (Sentry)
  uses `beforeSend` scrubbing so request data, headers, and cookies are stripped
  of secrets before transmission.
- Audit-log payloads (§13) capture *what changed*, not raw credentials.

---

## 13. Audit logging

Privileged and money-affecting actions are recorded to an append-only audit log:

- Each entry records the actor (user), the workspace, the action, the target
  entity, a timestamp, and a structured before/after summary — **never** raw
  secrets.
- Audit entries are written in the same transaction as the change where possible,
  so a successful action and its audit record are consistent.
- The audit log is queryable per workspace and exportable on higher plans
  (Scale: "Audit-log exports"). It exists so that "who approved this budget
  increase, and when?" always has an answer.

This pairs with the durable-jobs error/attempt tracking in
`docs/background-jobs.md`: long-running side effects are observable both in the
job record and the audit log.

---

## 14. Data isolation and transport

- **In transit:** all traffic is HTTPS/TLS. Session cookies are `Secure` in
  production; HSTS is expected at the edge.
- **At rest:** third-party tokens are application-encrypted (§3) on top of whatever
  disk/volume encryption your managed Postgres and object storage provide.
- **Tenant isolation:** enforced in the application layer by mandatory
  `workspace_id` scoping (§9). Database credentials are least-privilege and are
  themselves secrets delivered via the secret store.

---

## 15. Dependency and supply-chain hygiene

- Dependencies are pinned via the committed lockfile; `npm audit` /
  Dependabot-style review is part of routine maintenance.
- `server-only` is used to keep server modules (and the secrets they read) from
  ever being bundled into client code.
- CI should run typecheck, lint, and tests (`npm run check`) and a secret scan on
  pull requests.

---

## 16. What we explicitly do **not** claim

- We do **not** claim any certification or formal compliance (no SOC 2, ISO 27001,
  PCI DSS, HIPAA, or "GDPR-compliant" badge). Avokado does not store full card
  numbers — payment data is handled by Stripe.
- We do not promise that mock mode is representative of a hardened production
  deployment; production security depends on operating the controls in
  `docs/deployment.md`.
- Security is continuous work, not a finished state.

---

## Responsible disclosure

If you discover a security vulnerability in Avokado, please report it privately and
give us a reasonable chance to fix it before any public disclosure.

- **Email:** `security@tryavokado.com`
- **Please include:** a description, reproduction steps, affected
  endpoint/component, and the impact you believe it has. A minimal proof of concept
  helps enormously.
- **Please do not:** access or modify other users' data beyond what is necessary to
  demonstrate the issue, run automated scanners that degrade the service, or
  publicly disclose before we have responded.

We will acknowledge your report, keep you updated on remediation, and credit you if
you would like. We do not currently run a paid bug-bounty program, and we will not
pursue good-faith research conducted under this policy. For general security
questions, see [`/security`](/security) on the marketing site or use
[`/contact`](/contact).
