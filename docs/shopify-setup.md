# Shopify setup

How to connect a Shopify store to Avokado for catalog and store-context import.

> **What is implemented vs. what needs you.** The Shopify integration is built
> behind a single typed adapter contract (`ShopifyAdapter`). The mock
> implementation (`MockShopifyAdapter`) is complete and ships in the box — it
> returns clearly **labelled demo data** so the whole product is usable with no
> Shopify account. The live implementation (`LiveShopifyAdapter`) speaks the real
> Shopify Admin API and is gated on **your** credentials plus, for protected
> customer data, **Shopify app review**. See
> [What still requires you](#what-still-requires-you).

---

## How adapter selection works

Avokado never depends on a concrete Shopify implementation. At runtime it picks
an adapter from a small, deterministic rule (`lib/env.ts`):

```ts
integrations.shopify = Boolean(SHOPIFY_API_KEY && SHOPIFY_API_SECRET);
```

| Condition | Adapter used |
| --- | --- |
| `AVOKADO_MODE=mock` (default) | `MockShopifyAdapter` |
| `AVOKADO_MODE=live` **and** `SHOPIFY_API_KEY` + `SHOPIFY_API_SECRET` set | `LiveShopifyAdapter` |
| `AVOKADO_MODE=live` but credentials missing | `MockShopifyAdapter` (safe fallback) |

When the mock is active, the workspace shows a **Mock** badge and every imported
record is tagged as demo data. Nothing reaches the real Shopify API. You can
build, demo, and test the entire connect → import → review flow without creating
a Shopify app.

---

## Prerequisites for a live connection

- A Shopify store you control (or a development store from your Partner account).
- A **custom app** or **Partner app** with Admin API access.
- A publicly reachable Avokado deployment over **HTTPS** (Shopify requires HTTPS
  for OAuth redirect and webhook delivery; `localhost` will not work for live
  OAuth — use a tunnel such as a stable HTTPS dev URL during development).

---

## 1. Create a Shopify app

You can use either path:

- **Partner Dashboard → Apps → Create app** (recommended for multi-store /
  distributable apps and required for public distribution / app review).
- **Store admin → Settings → Apps and sales channels → Develop apps** (custom app
  scoped to a single store, fastest for testing one store).

During creation set the **App URL** and the **Allowed redirection URL(s)** to
match your deployment:

- App URL: `{SHOPIFY_APP_URL}` (e.g. `https://app.tryavokado.com`)
- Redirect URL: `{SHOPIFY_APP_URL}/api/integrations/shopify/callback`

After creation, copy the **API key** and **API secret key** from the app's
credentials screen.

## 2. Request the required scopes

Avokado requests **read-only**, least-privilege scopes. Do not grant write
scopes — Avokado never modifies your store.

| Scope | Why Avokado needs it |
| --- | --- |
| `read_products` | Products, variants, images, prices, and collections. |
| `read_orders` | Order and revenue **summaries** for context and reporting. |
| `read_content` | Store metadata (pages, policies, blog/content) for brand context. |

These are the default value of `SHOPIFY_SCOPES`. Configure the same scopes on the
app in the Shopify dashboard so the consent screen matches what Avokado asks for.

> `read_orders` is **protected customer data**. Shopify gates it behind app
> review for distributed apps and limits historical order access (typically the
> last 60 days) until your app is approved for a longer window. See
> [What still requires you](#what-still-requires-you).

## 3. OAuth flow

Avokado uses the standard Shopify OAuth 2.0 authorization-code grant:

1. **Start** — In Avokado, the user enters their `myshopify.com` domain and
   clicks Connect. Avokado redirects to
   `https://{shop}.myshopify.com/admin/oauth/authorize` with the app's API key,
   the requested `SHOPIFY_SCOPES`, the redirect URL, and a signed anti-CSRF
   `state` (and `nonce`) value.
2. **Consent** — The merchant approves the requested read scopes in Shopify.
3. **Callback** — Shopify redirects back to
   `{SHOPIFY_APP_URL}/api/integrations/shopify/callback`. Avokado verifies the
   returned **HMAC signature** and the `state`/`nonce`, then exchanges the
   temporary `code` for a permanent Admin API **access token**.
4. **Persist** — The access token is **encrypted at rest** (see
   [Token encryption](#token-encryption)) and associated with the workspace and
   the connected shop domain.
5. **First sync** — Avokado runs an initial import (below) and registers
   webhooks.

If credentials are missing or `AVOKADO_MODE=mock`, this flow is short-circuited
and `MockShopifyAdapter` is used instead — the UI still walks through a connect
screen, but no redirect to Shopify occurs.

## 4. Environment variables

Set these on the Avokado server (see `.env.example`). All are server-only; none
are exposed to the browser.

| Variable | Required for live | Description |
| --- | --- | --- |
| `SHOPIFY_API_KEY` | Yes | App **API key** from the Shopify app credentials. |
| `SHOPIFY_API_SECRET` | Yes | App **API secret key**. Used for the token exchange and HMAC/webhook verification. Treat as a secret. |
| `SHOPIFY_SCOPES` | No (has default) | Comma-separated scopes. Default: `read_products,read_orders,read_content`. |
| `SHOPIFY_APP_URL` | Yes | Public HTTPS base URL of this Avokado deployment, used to build the OAuth redirect and webhook callback URLs. |

```bash
# .env.local (example — never commit real secrets)
AVOKADO_MODE=live
SHOPIFY_API_KEY=your-shopify-api-key
SHOPIFY_API_SECRET=your-shopify-api-secret
SHOPIFY_SCOPES=read_products,read_orders,read_content
SHOPIFY_APP_URL=https://app.tryavokado.com
```

> Setting only these four variables enables the **live adapter**. Leaving any of
> `SHOPIFY_API_KEY` / `SHOPIFY_API_SECRET` empty, or keeping `AVOKADO_MODE=mock`,
> keeps the workspace on `MockShopifyAdapter`.

## 5. What gets imported

On the initial sync and on subsequent webhook-driven updates, the live adapter
imports (subject to granted scopes):

- **Products** — title, description, status, handle, vendor, product type, tags.
- **Variants** — option values, SKU, barcode, inventory state, weight.
- **Images** — product and variant media (URLs and alt text; binaries are not
  re-hosted unless you opt into asset import).
- **Prices** — variant price and compare-at price in the store currency.
- **Collections** — custom and smart collections and their product membership.
- **Store metadata** — shop name, primary domain, store currency, locale,
  timezone, and (via `read_content`) pages and policies used for brand context.
- **Order / revenue summaries** — aggregated order counts and revenue totals for
  reporting, **only when `read_orders` is granted and approved**. Avokado stores
  summaries for analytics, not full customer PII dumps.

Imported records are normalized into Avokado's internal product/catalog model so
downstream features (brand intelligence, creative, campaigns) are platform-
agnostic. Mock imports follow the same shape with demo content.

## 6. Webhooks

To keep the catalog fresh without polling, the live adapter registers Shopify
webhooks after connection. Typical topics:

- `products/create`, `products/update`, `products/delete`
- `collections/update`, `collections/delete`
- `orders/create` (summary aggregation only)
- `app/uninstalled` (auto-disconnect — see below)
- Compliance webhooks required by Shopify: `customers/data_request`,
  `customers/redact`, `shop/redact`.

Webhook delivery requires a public **HTTPS** endpoint at
`{SHOPIFY_APP_URL}/api/integrations/shopify/webhooks`. Every incoming webhook is
verified by its **HMAC signature** using `SHOPIFY_API_SECRET`; requests that fail
verification are rejected. The mock adapter does not register or receive
webhooks — it simulates change events locally for testing.

## 7. Token encryption

Shopify access tokens are sensitive long-lived credentials and are handled
accordingly:

- Tokens are encrypted at rest with **AES-256-GCM** using the app's
  `ENCRYPTION_KEY` (a 32-byte base64 key). They are stored encrypted, per
  workspace, alongside the shop domain.
- Tokens are **never** sent to the browser, never logged, and never returned by
  any API response.
- Rotating `ENCRYPTION_KEY` invalidates stored tokens and forces a reconnect.
  Plan key rotation alongside a reconnect prompt.

## 8. Disconnect and reconnect

- **Disconnect** (from Avokado) — Avokado revokes/forgets the stored access
  token, removes its encrypted record, and best-effort deletes the webhooks it
  registered. Imported catalog data can be retained or purged per workspace
  policy; the connection itself is removed.
- **Uninstall** (from Shopify) — If the merchant removes the app in Shopify,
  Shopify sends `app/uninstalled`; Avokado treats this as an automatic
  disconnect and stops syncing.
- **Reconnect** — Re-running the OAuth flow issues a fresh access token, which
  replaces the previous encrypted record and re-registers webhooks. If you have
  changed `SHOPIFY_SCOPES`, the merchant is prompted to re-consent to the new
  scope set.

## What still requires you

Everything above the API line is built; these steps are **outside** the codebase
and require your accounts/approvals before a live connection works:

1. **A real Shopify app** with API key + secret, App URL, and the redirect URL
   configured to your deployment.
2. **A public HTTPS deployment** for OAuth redirect and webhook delivery.
3. **Shopify app review for protected customer data** — `read_orders` (and full
   historical order access beyond the default recent window) requires submitting
   the app for review and complying with Shopify's Protected Customer Data
   requirements, including handling the mandatory compliance webhooks. Until
   approved, run with `read_products` + `read_content` only, or stay on the mock
   adapter.
4. **Production review / listing** if you intend to distribute the app publicly
   rather than install it as a custom app on a single store.

Until those are in place, leave `AVOKADO_MODE=mock` (or omit the Shopify
credentials) and the workspace will run on `MockShopifyAdapter` with labelled
demo data — fully functional for development and demos, with no real store data
involved.
