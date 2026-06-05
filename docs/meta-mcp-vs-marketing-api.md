# `MetaMcpAdapter` vs `MetaMarketingApiAdapter`

> Two implementations of the same typed `MetaAdapter` interface. This doc explains
> what each one is, the trade-offs between them, when to reach for which, and the
> standing rule that **all production mutations go through the typed Marketing API
> adapter + policy engine** while MCP stays an optional, agent-facing convenience.
>
> **`META_MCP_ENABLED` defaults to `false`.** MCP is off unless you turn it on.

For how to connect Meta, request permissions, and the draft-first safety policy,
see [`meta-setup.md`](./meta-setup.md).

---

## The shared contract

Everything in Avokado — onboarding, readiness checks, campaign-draft
materialisation, the policy engine, analytics, automations — depends only on the
`MetaAdapter` **interface**. It never imports a Meta SDK, an HTTP client, or an MCP
client directly. Three implementations satisfy the interface:

- **`MetaMarketingApiAdapter`** — the official Graph **Marketing API** over HTTPS.
- **`MetaMcpAdapter`** — an optional connector to a **Meta Ads MCP** server.
- **`MockMetaAdapter`** — an in-memory fake for mock mode (see
  [`mock-mode.md`](./mock-mode.md)).

Because the signatures are identical and typed with Zod-validated inputs/outputs,
choosing an implementation is configuration, not code. The active adapter for a
workspace is recorded in `meta_connections.adapter`.

---

## What each one is

### `MetaMarketingApiAdapter` (official Graph Marketing API)

A deterministic, typed client for Meta's documented Marketing API endpoints
(campaigns, ad sets, ads, creatives, insights, ad-account metadata). It is the
**production source of truth**:

- A **pinned** API version (`META_GRAPH_API_VERSION`, default `v23.0`) so behaviour
  does not drift when Meta changes a default.
- Inputs and outputs validated against typed schemas; unknown shapes are rejected,
  not guessed.
- Server-side auth with `appsecret_proof` and the AES-256-GCM-encrypted token.
- Every mutating call is **idempotent** (persisted in `integration_jobs` with a
  unique `idempotency_key`) and **audited** (`lib/audit.ts`).
- Bounded by the **policy engine** and `SAFETY_LIMITS` (budget-change caps,
  draft-first creation, approval gates).

This is the only path that may **create, update, pause, or change budgets** in
production.

### `MetaMcpAdapter` (optional Meta Ads MCP connector)

An **agent-facing** adapter that speaks the Model Context Protocol to a Meta Ads
MCP server (configured via `META_MCP_URL`, enabled only when
`META_MCP_ENABLED=true`). It exposes Meta capabilities as MCP **tools** an LLM can
call in a conversational loop, which is excellent for **exploration, ad-hoc
questions, and read-oriented assistance** ("which campaigns spent the most this
week and why?").

Its strengths are also its constraints:

- Tool schemas, behaviour, and versioning are defined by the **MCP server**, not by
  Avokado's typed contract — they can change outside our control.
- It introduces an extra hop and a less predictable surface than a pinned,
  first-party API client.
- It is **disabled by default** and, even when enabled, is **never** the path for
  production mutations.

---

## Trade-offs

| Dimension | `MetaMarketingApiAdapter` | `MetaMcpAdapter` |
| --- | --- | --- |
| **Control** | Full. We choose endpoints, fields, retries, the pinned API version, and exact payloads. | Partial. The MCP server frames the tools, fields, and behaviour; we adapt to it. |
| **Type-safety** | Strong. Zod-validated inputs/outputs; unexpected shapes are rejected. | Weaker by nature. Tool I/O is shaped by the server; results may need defensive parsing. |
| **Reliability** | High and predictable. Pinned version, explicit error taxonomy, deterministic retries. | Depends on a separate process and an LLM loop; more variability and failure modes. |
| **Auditability** | Complete. Idempotency key + before/after audit row for every change. | Harder to attribute precisely — a tool call may be one of several in a model turn. |
| **Idempotency** | Enforced via unique `integration_jobs.idempotency_key`. | Not guaranteed by the protocol; a model could repeat or vary a call. |
| **Safety rails** | Policy engine + `SAFETY_LIMITS` apply to every action. | Can bypass app-level policy unless explicitly routed back through it. |
| **Agent ergonomics** | Lower. Designed for code paths, not free-form tool calls. | High. Natural for conversational, exploratory, read-first agent workflows. |
| **Default state** | Always available in `live` mode (with credentials). | **Off** (`META_MCP_ENABLED=false`); opt-in only. |

The short version: the Marketing API adapter optimises for **control,
type-safety, reliability, and auditability**; the MCP adapter optimises for
**agent ergonomics**. Those goals pull in opposite directions, so Avokado uses
each where its strength fits and refuses to let agent ergonomics weaken the
guarantees around spend.

---

## When to use which

**Use `MetaMarketingApiAdapter` (always, for anything that matters):**

- Any **mutation** — creating campaign/ad set/ad drafts (paused), activating,
  pausing, or changing budgets.
- Readiness checks, selection enumeration, and structured reporting that feeds the
  product UI and the recommendation engine.
- Anything that must be idempotent, audited, reversible, or policy-bounded — i.e.
  anything touching money or live delivery.

**Use `MetaMcpAdapter` (optional, read-first, opt-in):**

- Conversational exploration and analysis where an agent benefits from calling
  Meta as MCP tools — "summarise yesterday's performance", "find ad sets with
  rising frequency".
- Internal experimentation and prototyping behind `META_MCP_ENABLED=true`.
- Drafting **suggestions** that a human (or the policy engine) then enacts through
  the Marketing API adapter — MCP proposes, the typed path disposes.

**Use `MockMetaAdapter`:**

- Local development, demos, CI, and tests — no Meta app required. See
  [`mock-mode.md`](./mock-mode.md).

---

## Why production mutations go through the typed Marketing API adapter

Mutations create or move money and live ad delivery, so they must be the most
controlled path in the system. Routing them exclusively through
`MetaMarketingApiAdapter` + the policy engine gives Avokado guarantees an
agent-driven MCP loop cannot match:

1. **Draft-first is enforceable.** The typed path always creates campaigns, ad
   sets, and ads **paused** and treats activation, budget changes, and pauses as
   separate, approval-gated actions recorded in the `approvals` table. A free-form
   tool call could activate something or raise a budget as an unverified side
   effect.
2. **Policy can actually intercept.** Every mutation passes through the policy
   engine and `SAFETY_LIMITS` (budget-increase caps, minimum-data thresholds before
   a performance pause). A typed chokepoint is where those rules live; a
   model-chosen tool call can route around them.
3. **Idempotency is guaranteed.** Each mutation carries an idempotency key backed
   by a **unique** `integration_jobs.idempotency_key`, so retries and double
   submissions cannot duplicate a campaign or double-apply a budget change. MCP
   offers no such guarantee.
4. **Auditability is complete and attributable.** Every change writes a
   before/after audit row tied to the actor, workspace, entity, and idempotency
   key. With MCP, a mutation is one step inside a model turn and is far harder to
   attribute, reconstruct, or reverse.
5. **Type-safety prevents malformed writes.** Validated request/response schemas
   and a pinned API version stop ambiguous or malformed payloads from reaching
   Meta. MCP tool I/O is shaped by the server and is comparatively loose.
6. **Billing stays hands-off.** The typed path **never** modifies payment methods
   or funding; it only reports billing readiness and guides the user to complete
   billing inside Meta. Keeping mutations off MCP removes any route by which an
   agent could attempt a financial change.

If an agent (via MCP) determines that a budget should rise or a campaign should
launch, it does not execute that itself. It produces a **proposal** that flows
through the same approval + policy + Marketing API pipeline as any human action.
**MCP proposes; the typed Marketing API adapter, gated by policy and human
approval, disposes.**

---

## Configuration recap

| Variable | Default | Effect |
| --- | --- | --- |
| `META_MCP_ENABLED` | `false` | When not exactly `"true"`, `MetaMcpAdapter` is never constructed. |
| `META_MCP_URL` | — | MCP server endpoint; required only when MCP is enabled. |
| `META_GRAPH_API_VERSION` | `v23.0` | Pinned Graph API version used by `MetaMarketingApiAdapter`. |

Even with `META_MCP_ENABLED=true`, production mutations remain on
`MetaMarketingApiAdapter` + the policy engine. Enabling MCP adds an optional
read-and-reason surface for agents; it does **not** grant a second write path.

---

## Related docs

- [`meta-setup.md`](./meta-setup.md) — connecting Meta, permissions, readiness
  checks, token encryption, and the draft-first policy.
- [`mock-mode.md`](./mock-mode.md) — `MockMetaAdapter` and auto-fallback.
- [`security.md`](./security.md) — token encryption, audit logging, SSRF.
