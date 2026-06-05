# Google Vertex AI setup

Avokado uses Google Vertex AI (Gemini family) for brand intelligence and
structured generation — extracting a brand book from a store, drafting strategy,
writing ad copy, and validating creative. This document explains how to enable
Vertex for local development and production.

> You do **not** need Vertex to run Avokado. With `AVOKADO_MODE=mock` (or with
> `AVOKADO_MODE=live` but no Vertex credentials present) every model call is
> served by a clearly-labelled mock adapter. See [`mock-mode.md`](./mock-mode.md).
> Configure Vertex only when you want real generations.

---

## 1. Create or choose a GCP project

1. Sign in to the [Google Cloud console](https://console.cloud.google.com/).
2. Create a new project (recommended for isolation) or select an existing one.
3. Note the **project ID** (not the display name) — for example `avokado-prod`.
   This becomes `GOOGLE_CLOUD_PROJECT`.
4. Ensure **billing is enabled** for the project. Vertex AI requires an active
   billing account; generation requests fail without one.

## 2. Enable the Vertex AI API

Enable the API on the project, either in the console or with `gcloud`:

```sh
gcloud services enable aiplatform.googleapis.com --project="$GOOGLE_CLOUD_PROJECT"
```

In the console, this is **APIs & Services → Enable APIs and Services →
"Vertex AI API" → Enable**.

## 3. Choose a location

Set `GOOGLE_CLOUD_LOCATION` to the region (or `global`) you want to serve from.

- `global` is the simplest default and is what `.env.example` ships with.
- A specific region (e.g. `us-central1`, `europe-west4`) may be required for data
  residency, lower latency, or model availability. **Model availability differs
  by region** — verify the models you configure (see §6) are offered in your
  chosen location.

## 4. Environment variables

Add these to `.env.local` for local dev (copy from `.env.example`):

```sh
# Tell the Google GenAI SDK to talk to Vertex (not the public Gemini API).
GOOGLE_GENAI_USE_VERTEXAI=true

# Your GCP project ID and serving location.
GOOGLE_CLOUD_PROJECT=avokado-dev
GOOGLE_CLOUD_LOCATION=global

# Local auth only — see §5. Leave EMPTY in production (use ADC / Workload Identity).
GOOGLE_APPLICATION_CREDENTIALS=
```

> Note: Google **sign-in** (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`) is a
> completely separate concern — those are OAuth login credentials and have
> nothing to do with Vertex AI access. Do not reuse one for the other.

## 5. Authentication

Avokado authenticates to Vertex with **Application Default Credentials (ADC)**.
The Google GenAI SDK resolves credentials automatically; you never paste a key
into application code.

### Local development — two supported options

**Option A — gcloud user ADC (preferred for local).** No key file to manage.

```sh
gcloud auth application-default login
gcloud config set project "$GOOGLE_CLOUD_PROJECT"
```

Leave `GOOGLE_APPLICATION_CREDENTIALS` **empty** when using this option — the SDK
finds the ADC credentials gcloud writes to your user config directory.

**Option B — a rotated, least-privilege service-account JSON.** Use this only if
user ADC is not viable. Create a dedicated service account with the **minimum**
role needed (`roles/aiplatform.user`), generate a JSON key, and store the file
**outside the repository** (e.g. `~/.config/avokado/vertex-sa.json`). Then:

```sh
GOOGLE_APPLICATION_CREDENTIALS=/Users/you/.config/avokado/vertex-sa.json
```

The repo's `.gitignore` already excludes `.env*`, `*.json` service keys, `*.key`,
and `*.pem`, but **do not rely on that alone** — keep the file in a directory that
is not under the project at all.

### Production — ADC via Workload Identity (no key files)

In production, **do not ship a service-account JSON**. Use the platform's
identity instead:

- **Google Cloud Run / GKE / Compute Engine:** attach a least-privilege service
  account to the workload (Workload Identity for GKE). ADC resolves the attached
  identity automatically — `GOOGLE_APPLICATION_CREDENTIALS` stays unset.
- **Non-Google hosts:** prefer **Workload Identity Federation** so the host's
  native identity is exchanged for short-lived Google credentials, again with no
  long-lived key file. If a key is truly unavoidable, source it from a managed
  secret store at runtime and rotate it on a schedule — never bake it into an
  image, env file, or build artifact.

Grant only `roles/aiplatform.user` (plus any storage role you genuinely need).
Avoid broad roles like `Editor` or `Owner`.

## 6. Configurable models

The three model roles are environment-driven so you can tune cost, latency, and
capability without code changes:

| Variable             | Role                                   | Example default      |
| -------------------- | -------------------------------------- | -------------------- |
| `VERTEX_TEXT_MODEL`  | High-quality reasoning & long-form     | `gemini-2.5-pro`     |
| `VERTEX_FAST_MODEL`  | Fast / cheap classification & drafts   | `gemini-2.5-flash`   |
| `VERTEX_VISION_MODEL`| Image understanding (creative, assets) | `gemini-2.5-flash`   |

> **Model IDs must be verified as current.** Model identifiers and their regional
> availability change over time and models get deprecated. Before relying on the
> example defaults above, confirm each ID against the official Vertex AI model
> reference and check it is offered in your `GOOGLE_CLOUD_LOCATION`. Do not assume
> a model ID from memory is still valid — verify it.

## 7. How Avokado calls Vertex

Every Vertex call goes through a **single typed adapter** — application code never
calls the SDK directly. The adapter guarantees, on every request:

- **Zod-validated structured output.** The caller supplies a Zod schema; the
  adapter requests structured JSON, parses it, and validates it. Output that does
  not match the schema is rejected (and retried) rather than passed downstream, so
  the rest of the app only ever sees well-typed data.
- **Retries** with backoff on transient/5xx/rate-limit errors, bounded by a
  maximum attempt count.
- **Timeouts** on every request so a hung call cannot stall a job or a route.
- **Usage tracking** — token counts, model, latency, and cost are recorded per
  call and attributed to the workspace for quotas and billing.

The same typed interface is implemented by the **mock adapter**, so the rest of
the application is identical whether it is talking to real Vertex or to mock mode.

## 8. Verify it works

With credentials configured and `AVOKADO_MODE=live`, exercise a feature that
generates (e.g. brand-book extraction during onboarding). Watch the logs for the
Vertex adapter recording model, token usage, and latency. If you instead see
**"Demo data"** labels, Vertex credentials were not detected and the request fell
back to the mock adapter — re-check §4 and §5.

---

## Security — read this

- **Never commit a service-account JSON, private key, `.pem`, or `.env*` file.**
  Local key files live outside the repo; production uses ADC / Workload Identity.
- **Treat any key that has ever been shared, pasted into a chat, committed, or
  logged as compromised.** Rotate it immediately: disable/delete the exposed key
  in IAM, issue a fresh one, and update only the runtime secret store. A leaked
  Google credential can incur real billing and data-access risk.
- **Least privilege always.** Scope service accounts to `roles/aiplatform.user`.
  Do not grant `Editor`/`Owner`.
- Vertex credentials and model outputs are **never** sent to the browser. All
  generation happens server-side behind the typed adapter.
