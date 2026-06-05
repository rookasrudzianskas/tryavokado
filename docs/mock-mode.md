# Mock mode

Avokado is designed to run **fully, end to end, with zero third-party
credentials.** Every external integration — store platforms, the Meta Marketing
API, Vertex AI, object storage, email — sits behind a typed adapter interface
with two implementations: a **live** adapter that talks to the real service and a
**mock** adapter that returns realistic, clearly-labelled demo data. Mock mode is
what makes the product demoable, testable, and developable without setting up
accounts at five vendors first.

---

## The mode switch

A single environment variable controls the default behaviour:

```sh
# Server-side mode.
AVOKADO_MODE=mock        # or: live
# Public copy so the UI can show the right labels/badges.
NEXT_PUBLIC_AVOKADO_MODE=mock
```

### `AVOKADO_MODE=mock` — everything is mocked

Every integration is forced to its **mock adapter**, regardless of whether any
real credentials happen to be present. This is the recommended default for local
development, demos, CI, and tests. Nothing leaves the machine; nothing is charged;
no account is required. All data is demo data and is labelled as such.

### `AVOKADO_MODE=live` — real where possible, mock where not

Each integration **independently** chooses its adapter:

- If that integration's credentials are present and valid → use the **real
  adapter**.
- If they are absent → **fall back to the mock adapter** for that integration
  only.

This per-integration fallback means you can light up one service at a time. With
`AVOKADO_MODE=live` you might have real Shopify and Vertex configured while Meta
and email remain on mock — and the app works coherently, with the mocked surfaces
clearly labelled as demo data. There is no all-or-nothing requirement and no hard
dependency on any single provider being configured.

> Rule of thumb: `mock` = "force mock everywhere"; `live` = "use real adapters
> only where credentials exist, otherwise mock."

---

## Demo data is always labelled, and never mixed with real data

Trust depends on a user always knowing what they are looking at. Mock mode never
disguises demo data as real:

- A global **`DemoModePill`** indicates when the workspace (or a surface within
  it) is operating on demo data.
- Mocked records and views carry a **"Demo data"** badge.
- Demo data and real data are **never blended** into the same list, chart, or
  total. A surface is either backed by a real adapter or by a mock adapter — not a
  silent mixture of both. When a workspace has some integrations live and some
  mocked, the mocked surfaces are individually labelled rather than merged into
  the real ones.

This makes mock mode safe to demo to a customer and safe to develop against
without ever shipping a misleading number.

---

## What mock mode provides

The mock adapters supply a complete, internally-consistent dataset so the entire
product flow can be exercised:

- **Demo store** — a connected ecommerce store (catalog, basic settings) so
  onboarding and store-connection flows complete without a real Shopify/WooCommerce
  account.
- **Products** — a representative product catalog with titles, descriptions,
  pricing, images, and variants.
- **Brand book** — an extracted brand profile (voice, tone, palette, typography,
  positioning) as if Vertex had analysed the store.
- **Assets** — a starter asset library (imagery/creative source files) for the
  asset and creative studio surfaces.
- **Meta account** — a mocked advertising account, including the structures needed
  to build and review campaign drafts.
- **Campaign drafts** — pre-built draft campaigns/ad sets/ads ready to review and
  approve, so the draft → approve flow is exercisable end to end.
- **Performance history** — historical metrics (spend, impressions, clicks,
  conversions, ROAS over time) to populate analytics dashboards and charts.
- **Recommendations** — generated optimisation suggestions of each supported type
  so the recommendation review/validation flow can be demonstrated.

Together these cover the primary happy path: register → workspace → connect demo
store → brand → strategy → asset → creative → campaign draft → approve → analytics
→ recommendation — all without a single external credential.

---

## Mock adapters conform to the production interfaces

This is the core principle that makes mock mode trustworthy rather than a throwaway
fixture:

**Every mock adapter implements the exact same typed (TypeScript) interface as its
production counterpart.** The integration boundary is defined once as an interface
(e.g. a store-platform adapter, a Meta adapter, the Vertex model adapter); the
live and mock implementations are interchangeable behind it. Application code,
server actions, background jobs, and validation receive identically-shaped, typed
results either way and **cannot tell which adapter answered** — only the data's
provenance (and its "Demo data" labelling) differs.

Consequences:

- The same Zod validation, policy checks, budget limits, and authorization run
  against mock and live data alike.
- Switching an integration from mock to live changes only which implementation is
  resolved — not the calling code, the types, or the UI.
- Tests run against mock adapters with confidence that they exercise the same
  contracts production uses. See [`testing.md`](./testing.md).

---

## Choosing a mode

| Scenario                                   | Recommended setting                          |
| ------------------------------------------ | -------------------------------------------- |
| Local development (default)                | `AVOKADO_MODE=mock`                          |
| Demo to a prospect                         | `AVOKADO_MODE=mock` (everything labelled)    |
| CI / unit / integration / E2E tests        | `AVOKADO_MODE=mock`                          |
| Bringing up one real integration at a time | `AVOKADO_MODE=live` + only that integration's credentials |
| Full production                            | `AVOKADO_MODE=live` + all required credentials |

Per-integration setup (what credentials each real adapter needs) is documented in
the integration guides, e.g. [`google-vertex-setup.md`](./google-vertex-setup.md).
