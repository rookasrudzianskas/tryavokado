# Testing strategy

Avokado is tested at two layers: **Vitest** for unit and integration tests of the
business logic, and **Playwright** for the primary end-to-end happy path. The goal
is high confidence in the rules that protect money, data, and tenant boundaries —
plus a single full-journey E2E that proves the product hangs together.

Because every integration runs behind a typed adapter with a mock implementation
(see [`mock-mode.md`](./mock-mode.md)), the entire suite runs with
`AVOKADO_MODE=mock` and **no external credentials**. Tests never call a real
vendor.

---

## Commands

```sh
# Unit + integration (Vitest, single run — used in CI).
npm run test

# Unit + integration in watch mode (local TDD).
npm run test:watch

# End-to-end happy path (Playwright).
npm run test:e2e

# Full local gate: typecheck + lint + unit/integration tests.
npm run check
```

`npm run test` maps to `vitest run`; `npm run test:e2e` maps to `playwright test`.

---

## The test database (`avokado_test`)

Integration and E2E tests run against a **dedicated** Postgres database,
`avokado_test`, kept entirely separate from `avokado_dev` so a test run can never
corrupt development data.

- Point tests at it with a test-scoped `DATABASE_URL`, e.g.
  `postgresql://user:password@localhost:5432/avokado_test` (set in the test
  environment / `.env.test`, not in `.env.local`).
- The schema is applied with the normal Drizzle migrations before the suite runs,
  so `avokado_test` always matches the current schema.
- Tests reset/seed deterministically between runs (truncate-and-seed or
  transactional rollback per test) so each test starts from a known state and the
  suite is order-independent and repeatable.

Create it once locally if it does not exist:

```sh
createdb avokado_test
```

---

## Vitest — unit & integration

Vitest covers the logic where correctness is non-negotiable. Target areas:

- **Validation schemas** — the Zod schemas that guard env, forms, server-action
  inputs, and model output. Tests assert that valid payloads pass and that
  malformed/edge-case payloads are rejected with the right errors.
- **Policy engine** — the advertising policy/guardrail checks that gate what may
  be published. Tests cover allowed vs. blocked content and the reasons returned.
- **Budget limits** — daily/lifetime budget and spend-cap enforcement, including
  boundary values, so a campaign can never be drafted or approved over its limit.
- **Recommendation validation** — generated recommendations are validated against
  their schema and business rules before they can be surfaced or applied; invalid
  ones are rejected.
- **Workspace authorization** — multi-tenant RBAC: a member of one workspace can
  never read or mutate another workspace's data, and each role
  (owner/admin/member/etc.) is allowed exactly the actions it should be. This is
  the most security-critical suite.
- **Adapter interfaces** — the mock adapters conform to the same typed contracts
  as the live adapters, so logic tested against mocks holds for production. Tests
  assert the adapter contract shape and behaviour.
- **Idempotency** — operations that must run at-most-once (campaign creation,
  approvals, webhook handling, background jobs) are safe to retry: replaying the
  same idempotency key does not double-apply an effect.
- **URL safety / SSRF** — URL validation used when fetching store/website content:
  reject internal/loopback/link-local/metadata addresses and disallowed schemes so
  a user-supplied URL cannot drive a server-side request at an internal target.

Run them with `npm run test` (or `npm run test:watch` while developing). Keep
unit tests pure where possible; reserve DB-backed `avokado_test` access for the
genuinely integration-level cases (authorization, idempotency).

---

## Playwright — primary happy-path E2E

One comprehensive Playwright spec walks the **entire core journey** against the
app running in mock mode, proving the surfaces connect end to end:

1. **Register** a new account.
2. Create a **workspace**.
3. **Connect the demo store** (mock store adapter — no real Shopify/WooCommerce).
4. Generate / review the **brand** book.
5. Produce a **strategy**.
6. Create an **asset**.
7. Generate a **creative**.
8. Build a **campaign draft**.
9. **Approve** the draft.
10. View **analytics** (mock performance history).
11. Review a **recommendation**.

Because mock mode supplies a complete, internally-consistent dataset (demo store,
products, brand book, assets, Meta account, drafts, performance history,
recommendations), this single flow runs deterministically with no external
credentials and no flakiness from third-party services.

Run it with `npm run test:e2e`.

---

## Conventions

- Default every test environment to `AVOKADO_MODE=mock`; tests must not depend on
  real vendor credentials or network access to a third party.
- Use `avokado_test` for anything that touches the database; never point tests at
  `avokado_dev` or a production database.
- Prefer deterministic seed data and stable selectors (roles / accessible names)
  in Playwright so E2E stays reliable.
- `npm run check` (typecheck + lint + unit/integration) is the local gate before
  pushing; the E2E suite runs via `npm run test:e2e`.
