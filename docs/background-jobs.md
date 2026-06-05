# Background Jobs

Avokado runs all slow, external, or side-effecting work as **durable background
jobs** on [Inngest](https://www.inngest.com). Anything that talks to a third-party
API, generates with an AI model, processes media, or spends money runs here — never
inline in a request — so the UI stays responsive and the work survives deploys,
timeouts, and transient provider failures.

Every job in Avokado obeys the same five contracts:

1. **Idempotent** — running it twice produces one result and **never duplicates
   side effects** (no double-charged budget, no duplicate uploaded asset).
2. **Reports progress** — updates a `progress` percentage and a human-readable
   `step` as it advances.
3. **Supports retries** — failed steps retry with backoff; the job is safe to
   replay.
4. **Records errors** — the failure message and attempt count are persisted, not
   just logged.
5. **Exposes status** — through the `integration_jobs` table and the reusable
   [`JobStatus`](#7-jobstatus-ui-component) UI component.

---

## 1. Job catalog

Each job is an Inngest function triggered by a typed event. The `type` column on
`integration_jobs` records which job a row belongs to.

| Job | Trigger event | What it does | Notable side effects |
| --- | --- | --- | --- |
| **Store sync** | `store/sync.requested` | Pull products, collections, and content from Shopify / WooCommerce into the catalog. | Upserts catalog rows. |
| **Website inspection** | `website/inspect.requested` | Fetch and parse a brand site (SSRF-validated, see security doc §5) to extract brand signals. | Outbound fetch only. |
| **Screenshot capture** | `website/screenshot.requested` | Capture full-page screenshots of the brand site for analysis and the brand book. | Writes images to R2. |
| **Brand analysis** | `brand/analyze.requested` | Use Vertex AI to derive voice, palette, audience, and positioning from store + site + screenshots. | Writes brand profile + a new brand version. |
| **Brand-book PDF** | `brand/book.export.requested` | Render the approved brand book to a downloadable PDF. | Writes a PDF to R2. |
| **Asset analysis** | `asset/analyze.requested` | Analyze an uploaded image (labels, safety, suitability, dominant colors) via the vision model. | Writes asset metadata. |
| **Video processing** | `asset/video.process.requested` | Transcode/normalize uploaded video, extract a poster frame and duration. | Writes derived media to R2. |
| **Meta asset upload** | `meta/asset.upload.requested` | Upload an approved image/video to the Meta ad account's library. | **Creates a Meta ad image/video** (money-adjacent, external). |
| **Meta campaign creation** | `meta/campaign.create.requested` | Create the campaign → ad set → ad structure in Meta from an **approved** draft. | **Creates Meta objects / can enable spend.** |
| **Meta insight sync** | `meta/insights.sync.requested` | Pull delivery + performance metrics for active campaigns. | Upserts insight rows. |
| **Recommendation generation** | `reco/generate.requested` | Analyze recent performance and produce ranked, draft recommendations. | Writes recommendation drafts (no spend). |
| **Automation evaluation** | `automation/evaluate.requested` | Evaluate safe-automation rules against current state; emit **draft** actions within `SAFETY_LIMITS`. | May enqueue approval-gated actions. |
| **Email** | `email/send.requested` | Send a transactional email via Resend (invite, digest, alert, receipt). | **Sends an email** (external). |

The jobs marked with external/money-adjacent side effects (Meta upload, Meta
campaign creation, email) are exactly the ones where idempotency matters most — see
§3.

A typical pipeline fans out across several of these: connecting a store triggers
**store sync → website inspection → screenshot capture → brand analysis**; building
a campaign runs **asset analysis → (video processing) → Meta asset upload → Meta
campaign creation**, each gated by approval where it touches Meta.

---

## 2. The `integration_jobs` table

Every job's lifecycle is recorded in `integration_jobs` (defined in
`lib/db/schema/campaigns.ts`). It is the single source of truth that the UI reads.

| Column | Type | Meaning |
| --- | --- | --- |
| `id` | id (cuid2) | Primary key. |
| `workspace_id` | text → `workspaces.id` | Tenant scope (cascade on workspace delete). |
| `type` | text | Which job (e.g. `meta.campaign.create`). |
| `status` | enum | `queued` · `running` · `succeeded` · `failed` · `cancelled`. |
| `idempotency_key` | text (**unique**) | De-dupe key; see §3. |
| `progress` | int (default 0) | 0–100 percent complete. |
| `step` | text | Human-readable current step (e.g. "Uploading creative 2/5"). |
| `input` | jsonb | The job's input parameters. |
| `result` | jsonb | The successful output (ids of created entities, URLs, counts). |
| `error` | text | Last error message on failure. |
| `attempts` | int (default 0) | How many times execution has been attempted. |
| `started_at` / `finished_at` | timestamptz | Execution window. |
| `created_at` / `updated_at` | timestamptz | Row timestamps. |

Indexes: `(workspace_id, status)` for the dashboard, and a **unique index on
`idempotency_key`** which is what makes "exactly one job per key" enforceable at the
database level (§3).

> The `status` enum values map 1:1 to the `JobState` union in the `JobStatus`
> component (§7), so a row can be rendered directly.

---

## 3. Idempotency and avoiding duplicate side effects

Jobs can be delivered or retried more than once: Inngest retries on failure, a user
may click twice, and a deploy can replay an in-flight run. Correctness therefore
depends on **idempotency**, not on hoping each job runs exactly once.

### Idempotency keys

Every job is created with a deterministic **idempotency key** derived from its
business identity — *not* a random value. The key answers "is this the same logical
unit of work?"

```
type + ":" + workspaceId + ":" + stableEntityIdentity
```

Examples:

- Meta campaign creation: `meta.campaign.create:{workspaceId}:{draftId}:{draftVersion}`
- Meta asset upload: `meta.asset.upload:{workspaceId}:{assetId}:{adAccountId}`
- Store sync: `store.sync:{workspaceId}:{storeId}:{since}`
- Email: `email.send:{workspaceId}:{template}:{recipientId}:{dedupeWindow}`

Because `integration_jobs.idempotency_key` is **uniquely indexed**, enqueueing a job
performs an upsert-style "insert if absent": a second enqueue with the same key
**returns the existing job instead of starting a new one**. Inngest functions are
additionally configured with an `idempotency` expression on the same key so the
durable runtime collapses duplicate events within its window. The two layers
combine: the DB unique index is the durable guarantee; the Inngest idempotency
window cheaply absorbs rapid duplicates.

### Avoiding duplicate external side effects

A unique job row prevents *two jobs*; it does not by itself prevent *one retried
job* from creating two Meta campaigns if it fails after the create but before
recording success. So each externally-visible side effect is made idempotent
end-to-end:

- **Step-level durability.** Inngest `step.run(...)` memoizes each completed step's
  output. On retry, already-completed steps are **not re-executed** — only the
  step that failed (and those after it) run again. Keep each side-effecting call in
  its own step.
- **Provider idempotency / request keys.** Where the provider supports it, pass an
  idempotency token (e.g. Stripe-style) or a deterministic client-generated id so
  the provider de-duplicates server-side.
- **Check-then-act with a stable external reference.** Before creating an external
  object, look it up by a deterministic name/reference (e.g. an Avokado
  `draftId`/`assetId` stored in the object's name or our mapping table). If it
  already exists, adopt it instead of creating a duplicate. Persist the external id
  in `result` as soon as it is known so a later retry can short-circuit.
- **Idempotent writes to our own DB.** Use upserts keyed by business identity, not
  blind inserts, so re-running a sync or analysis converges rather than duplicates.
- **Webhook handlers** (Stripe, Meta) de-dupe on the provider event id (see
  `docs/security.md` §11) for the same reason.

The rule of thumb: **a job must be safe to run from the top as many times as
needed and still leave the world in exactly one correct state.**

---

## 4. Progress reporting

Long jobs update `progress` (0–100) and `step` as they advance, so the UI can show
meaningful motion rather than an indeterminate spinner.

- Set `status = running` and `started_at` when execution begins.
- After each meaningful phase, write `progress` and a short `step` string
  ("Fetching products", "Analyzing brand voice", "Uploading creative 3/5").
- Fan-out jobs compute progress from completed/total units of work.
- The UI polls (or subscribes to) the job row and re-renders `JobStatus`; because
  `step` is plain text, no client logic is needed to describe what is happening.

---

## 5. Retries and error handling

- **Retries with backoff.** Inngest retries failed steps automatically with
  exponential backoff. Because steps are memoized (§3), retries resume from the
  failed step rather than the beginning. `attempts` is incremented so the history
  is visible.
- **Transient vs. terminal.** Network blips, `429`s, and `5xx`s are transient and
  should be retried (respect `Retry-After`). Validation errors, `4xx` auth/permission
  failures, and policy violations are terminal — fail fast, do **not** burn retries.
- **Recording errors.** On terminal failure (or once retries are exhausted), set
  `status = failed`, write the sanitized message to `error`, and stamp
  `finished_at`. Secrets are redacted before anything is stored or logged
  (`docs/security.md` §12).
- **Audit + observability.** Money-affecting jobs also write to the audit log
  (`docs/security.md` §13); failures surface in Sentry with secrets scrubbed.
- **Cancellation.** A job may be cancelled (`status = cancelled`) before it starts
  or between steps; in-flight external side effects already committed are reconciled
  by the same check-then-act logic on any subsequent run.

---

## 6. Job lifecycle (state machine)

```
                 enqueue (idempotency key)
                          │
                          ▼
                       queued ───────────────► cancelled
                          │                        ▲
                    start │                        │ cancel
                          ▼                        │
                       running ─────────────────────
                       │  ▲ │
        progress/step  │  │ │ step fails → retry (attempts++, backoff)
                       │  └─┘
            success    │            terminal failure / retries exhausted
                       ▼                          │
                   succeeded                      ▼
                  (result set)                  failed
                                              (error set)
```

`started_at` is stamped on entry to `running`; `finished_at` on entry to
`succeeded`, `failed`, or `cancelled`.

---

## 7. `JobStatus` UI component

Every durable job is surfaced in the UI with one reusable component,
`components/app/job-status.tsx`. Its `state` prop is exactly the
`integration_jobs.status` enum, so a job row renders without translation.

```tsx
import { JobStatus } from "@/components/app/job-status";

<JobStatus
  state={job.status}        // "queued" | "running" | "succeeded" | "failed" | "cancelled"
  progress={job.progress}   // 0–100; drives the progress bar while running/queued
  step={job.step}           // e.g. "Uploading creative 3/5" (shown only while running)
  error={job.error}         // shown only when state === "failed"
/>;
```

Behavior:

- **queued** — clock icon, muted; bar at 0.
- **running** — spinning loader in the accent color, the `step` label, and a
  progress bar driven by `progress`.
- **succeeded** — check icon ("Complete").
- **failed** — error icon plus the `error` message in destructive color.
- **cancelled** — slashed-circle icon, muted.

Use it anywhere a job is shown — a connection panel, a campaign-build drawer, an
asset row, the Inngest-backed activity feed — for one consistent, honest
representation of background work across the whole product.

---

## 8. Adding a new job (checklist)

- [ ] Define a typed trigger event and an Inngest function for it.
- [ ] Compute a **deterministic idempotency key** from business identity (§3); rely
      on the unique `idempotency_key` index for de-dupe.
- [ ] Create the `integration_jobs` row on enqueue; set `type` and `input`.
- [ ] Wrap each side-effecting call in its own `step.run` so retries resume, not
      restart.
- [ ] Make every external side effect idempotent (provider idempotency token or
      check-then-act with a stable reference; persist external ids into `result`
      early).
- [ ] Report `progress` + `step` at each phase.
- [ ] Classify errors transient vs. terminal; on terminal, set `status=failed`,
      `error`, `finished_at`; ensure secrets are redacted.
- [ ] Scope all DB access by `workspace_id`; audit-log money-affecting outcomes.
- [ ] Render it with `JobStatus`.
