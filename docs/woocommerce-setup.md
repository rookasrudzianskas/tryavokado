# WooCommerce setup

How to connect a WooCommerce store to Avokado for catalog and store-context
import using the WooCommerce REST API.

> **What is implemented vs. what needs you.** The WooCommerce integration is
> built behind a single typed adapter contract (`WooCommerceAdapter`). The mock
> implementation (`MockWooCommerceAdapter`) is complete and ships in the box — it
> returns clearly **labelled demo data**, so the product is fully usable with no
> store. The live implementation (`LiveWooCommerceAdapter`) calls your store's
> REST API and is gated on **your** store URL + API keys. Unlike Shopify there is
> no OAuth app and no platform app review — WooCommerce uses per-store API keys
> that the user generates and enters directly.

---

## How adapter selection works

Avokado never depends on a concrete WooCommerce implementation. WooCommerce is
**per-store**: there is no global app secret. The connection is decided by
whether a workspace has saved a store URL and a valid consumer key/secret pair.

| Condition | Adapter used |
| --- | --- |
| `AVOKADO_MODE=mock` (default) | `MockWooCommerceAdapter` |
| `AVOKADO_MODE=live` **and** workspace has a verified store URL + consumer key/secret | `LiveWooCommerceAdapter` |
| `AVOKADO_MODE=live` but no/invalid store credentials | `MockWooCommerceAdapter` (safe fallback) |

When the mock is active the workspace shows a **Mock** badge and every imported
record is tagged as demo data — nothing contacts a real store. You can build,
demo, and test the full connect → verify → import flow without any WooCommerce
account.

> Because credentials are entered per store in the UI and encrypted at rest,
> WooCommerce needs **no global `.env` secret**. `.env.example` documents this
> explicitly under the WooCommerce section.

---

## Prerequisites for a live connection

- A WooCommerce store (WordPress + the WooCommerce plugin) you administer.
- The store served over **HTTPS**. WooCommerce REST API authentication for
  product/order data must travel over TLS; Avokado **rejects non-HTTPS store
  URLs** for live connections to avoid transmitting keys in the clear. (A plain
  `http://` store can only be used against the mock adapter.)
- Pretty permalinks enabled in WordPress (Settings → Permalinks set to anything
  other than "Plain"), so the `/wp-json/wc/v3/` REST routes resolve.

---

## 1. Generate REST API consumer key/secret

In the WooCommerce store admin:

1. Go to **WooCommerce → Settings → Advanced → REST API**.
2. Click **Add key**.
3. Fill in:
   - **Description** — e.g. `Avokado (read-only)`.
   - **User** — an account with permission to read products and orders.
   - **Permissions** — set to **Read** only. Avokado never writes to your store,
     so do **not** grant Read/Write. (Least-privilege, read-only keys.)
4. Click **Generate API key**.
5. Copy the **Consumer key** (`ck_...`) and **Consumer secret** (`cs_...`).
   WooCommerce shows the secret **once** — copy it now.

If you ever need to revoke Avokado's access, return to this screen and delete the
key; the live connection stops working immediately.

## 2. Enter the store URL and keys in Avokado

In Avokado, open **Integrations → WooCommerce → Connect** and provide:

| Field | Example | Notes |
| --- | --- | --- |
| **Store URL** | `https://store.example.com` | Must be `https://`. The store's base URL, not the `/wp-json` path — Avokado appends the REST route. |
| **Consumer key** | `ck_xxxxxxxx...` | The `ck_` value from step 1. |
| **Consumer secret** | `cs_xxxxxxxx...` | The `cs_` value from step 1. Stored encrypted. |

Avokado authenticates to the REST API over HTTPS (Basic auth using the
key/secret) and normalizes the store base URL before saving.

### Credentials encrypted at rest

The consumer secret (and the key) are encrypted with **AES-256-GCM** using the
app's `ENCRYPTION_KEY`, stored per workspace, and are **never** sent to the
browser, written to logs, or returned by any API response. Rotating
`ENCRYPTION_KEY` invalidates saved credentials and requires reconnecting.

## 3. Connection verification

When you submit the form, Avokado verifies the connection **before** saving it as
live:

1. Confirms the store URL is `https://` and well-formed.
2. Calls a lightweight read endpoint (e.g. `GET /wp-json/wc/v3/system_status` or
   `GET /wp-json/wc/v3/products?per_page=1`) with the provided key/secret.
3. Checks for a `200` response and valid WooCommerce JSON, confirming the keys
   are valid and have **read** access.

On success the credentials are encrypted and saved, the workspace flips to a
**Configured** state, and the first import runs. On failure (wrong keys,
non-HTTPS URL, unreachable host, missing read permission, or REST routes
disabled) Avokado surfaces a clear error and does **not** persist the
credentials — the workspace stays on the mock adapter.

## 4. What gets imported

On the initial sync and on scheduled re-syncs, the live adapter imports (subject
to what your key can read):

- **Products** — name, description/short description, status, slug, type, SKU,
  tags.
- **Variants** — variation attributes, SKU, and stock state for variable
  products.
- **Categories** — product categories and membership (Woo's equivalent of
  collections).
- **Images** — product and variation media (URLs and alt text).
- **Prices** — regular price and sale price in the store currency.
- **Order summaries** — aggregated order counts and revenue totals for reporting,
  **only when the key can read orders** and the store exposes them. Avokado
  stores summaries, not full customer PII dumps.

WooCommerce has no OAuth scopes; what Avokado can read is governed entirely by
the **WordPress user** the key belongs to and the **Read** permission level.
Imported records are normalized into Avokado's internal catalog model so
downstream features stay platform-agnostic. Mock imports use the same shape with
demo content.

## 5. Disconnect and reconnect

- **Disconnect** — Avokado deletes the encrypted credentials and stops syncing.
  Imported catalog data can be retained or purged per workspace policy. For full
  revocation, also delete the API key in **WooCommerce → Settings → Advanced →
  REST API** so it can never be reused.
- **Reconnect** — Re-enter the store URL and a (new) consumer key/secret. Avokado
  re-runs verification and, on success, replaces the previous encrypted
  credentials. Generating a fresh key in WooCommerce and pasting it here is the
  recommended way to rotate access.

## Mock adapter fallback

With no credentials, an unverifiable connection, or `AVOKADO_MODE=mock`, the
workspace runs on `MockWooCommerceAdapter`:

- Returns a labelled demo catalog (products, variants, categories, images,
  prices, and order summaries) in the same normalized shape as live data.
- Never contacts a real store and requires no WordPress account.
- Lets you build and demo the entire connect → verify → import → review flow
  end-to-end.

## What still requires you

These steps live **outside** the codebase and are needed before a live
connection works:

1. **A WooCommerce store over HTTPS** with pretty permalinks enabled so the REST
   API is reachable.
2. **Read-only REST API consumer key + secret** generated in the store admin and
   pasted into Avokado.
3. Nothing else — there is **no** OAuth app, no `.env` secret, and **no platform
   app review** for WooCommerce. Access is governed by the key's WordPress user
   and its Read permission, and is revocable at any time by deleting the key.

Until a store is connected and verified, leave `AVOKADO_MODE=mock` (or simply
don't add credentials) and the workspace runs on `MockWooCommerceAdapter` with
labelled demo data.
