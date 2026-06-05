# Avokado — Local Development

This guide gets Avokado running on your machine from a clean checkout. The app
is **local-first**: with zero third-party credentials it boots fully in **mock
mode**, so you only need Node and PostgreSQL to start building.

---

## 1. Prerequisites

| Tool | Version | Why |
| --- | --- | --- |
| **Node.js** | **22.x** (pinned to `22.13.1` via `.nvmrc` / `.node-version`) | Runtime + build |
| **npm** | Bundled with Node 22 | Package manager |
| **PostgreSQL** | **16** | Primary database |
| **openssl** | Any recent | Generating secrets |
| Git | Any recent | Source control |

### Install Node with nvm

If you do not have [nvm](https://github.com/nvm-sh/nvm) yet, install it, then let
it pick up the version pinned in the repo:

```sh
nvm install      # reads .nvmrc → installs 22.13.1
nvm use          # switches the current shell to 22.13.1
node --version   # → v22.13.1
```

### Install PostgreSQL 16

Pick whichever fits your platform:

```sh
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Debian / Ubuntu
sudo apt install postgresql-16

# Or run it in Docker
docker run --name avokado-pg -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 -d postgres:16
```

Make sure `psql`, `createdb`, and friends are on your `PATH`.

---

## 2. Step-by-step setup

From the repository root (`tryavokado/`):

### 1. Select the correct Node version

```sh
nvm use
```

### 2. Install dependencies

```sh
npm install
```

### 3. Create your local env file

```sh
cp .env.example .env.local
```

`.env.local` is git-ignored. **Never commit it** or any real secret.

### 4. Generate secrets

Avokado needs two locally-generated secrets. Each must be a fresh 32-byte
base64 value:

```sh
# Session-signing secret → BETTER_AUTH_SECRET
openssl rand -base64 32

# AES-256-GCM key for encrypting stored tokens → ENCRYPTION_KEY
openssl rand -base64 32
```

Paste each value into the matching key in `.env.local`:

```dotenv
BETTER_AUTH_SECRET=<first generated value>
ENCRYPTION_KEY=<second generated value>
```

Leave `AVOKADO_MODE=mock` for now — every integration will fall back to a
clearly labelled mock adapter, so no other credentials are required to run the
app. Add real vendor keys later, only when you want to talk to a real service.

### 5. Create the database

```sh
createdb avokado_dev
```

Confirm `DATABASE_URL` in `.env.local` points at it (the default already does):

```dotenv
DATABASE_URL=postgresql://user:password@localhost:5432/avokado_dev
```

Adjust the user/password/host to match your local Postgres.

### 6. Run migrations

This applies the SQL migrations in `/drizzle` to your database:

```sh
npm run db:migrate
```

### 7. Seed development data

```sh
npm run db:seed
```

This populates a demo workspace and supporting records so the dashboard has
something to show.

### 8. Start the dev server

```sh
npm run dev
```

Open <http://localhost:3000>. Register an account, and you are in.

---

## 3. npm scripts

| Script | Command | What it does |
| --- | --- | --- |
| `dev` | `next dev` | Start the development server with hot reload |
| `build` | `next build` | Production build |
| `start` | `next start` | Serve the production build |
| `lint` | `eslint` | Lint the codebase |
| `lint:fix` | `eslint --fix` | Lint and auto-fix |
| `typecheck` | `tsc --noEmit` | Strict TypeScript type-check |
| `format` | `prettier --write .` | Format all files |
| `format:check` | `prettier --check .` | Verify formatting without writing |
| `db:generate` | `drizzle-kit generate` | Generate a migration from schema changes |
| `db:migrate` | `drizzle-kit migrate` | Apply pending migrations |
| `db:push` | `drizzle-kit push` | Push schema directly (prototyping only) |
| `db:studio` | `drizzle-kit studio` | Open Drizzle Studio to browse the DB |
| `db:seed` | `tsx scripts/seed.ts` | Seed development data |
| `test` | `vitest run` | Run unit tests once |
| `test:watch` | `vitest` | Run unit tests in watch mode |
| `test:e2e` | `playwright test` | Run end-to-end tests |
| `check` | `typecheck && lint && test` | Full pre-push gate |

**Schema workflow:** edit a file in `lib/db/schema/*`, run `npm run db:generate`
to produce a migration in `/drizzle`, then `npm run db:migrate` to apply it. Use
`db:push` only for throwaway prototyping — never against shared data.

**Before pushing:** run `npm run check` to catch type, lint, and test failures
in one shot.

---

## 4. Environment variable overview

Only the **Core** block is required for local development; everything else is
optional and defaults to a mock adapter when left blank.

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres connection string |
| `BETTER_AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | Yes | `openssl rand -base64 32`; AES-256-GCM key |
| `NEXT_PUBLIC_APP_URL` / `BETTER_AUTH_URL` | Yes | `http://localhost:3000` in dev |
| `AVOKADO_MODE` | Yes | `mock` (default) or `live` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | No | Enables Google sign-in |
| Vertex AI (`GOOGLE_CLOUD_*`, `VERTEX_*`) | No | Brand intelligence / generation |
| Shopify / WooCommerce / Meta | No | Store + ad integrations |
| Stripe (`STRIPE_*`) | No | Subscription billing |
| R2 / S3 (`R2_*`) | No | Asset storage |
| Inngest (`INNGEST_*`) | No | Background jobs |
| Resend (`RESEND_API_KEY`, `EMAIL_FROM`) | No | Transactional email |
| Sentry / PostHog | No | Monitoring & analytics |

See `.env.example` for the full annotated list. Secrets such as
service-account JSON must live **outside** the repo and are never committed.

---

## 5. Troubleshooting

**`DATABASE_URL is required for drizzle-kit`**
Drizzle Kit loads `.env.local` then `.env` directly (it runs outside Next). Make
sure `DATABASE_URL` is set in `.env.local` and that you are running the command
from the repo root.

**`db:migrate` cannot connect / `ECONNREFUSED 127.0.0.1:5432`**
Postgres is not running or is on a different host/port. Start it
(`brew services start postgresql@16`, or your Docker container) and confirm the
host, port, user, and password in `DATABASE_URL`.

**`database "avokado_dev" does not exist`**
Run `createdb avokado_dev` (step 5) before migrating.

**`password authentication failed for user`**
The credentials in `DATABASE_URL` do not match your local Postgres role. Update
the user/password in the connection string, or create a matching role.

**Auth errors / "secret is required" on login**
`BETTER_AUTH_SECRET` is empty. Generate one with `openssl rand -base64 32` and
set it in `.env.local`, then restart `npm run dev`.

**Decryption errors after rotating keys**
`ENCRYPTION_KEY` must stay stable for the lifetime of any data encrypted with
it. Changing it makes previously stored tokens undecryptable. For a clean local
reset, drop and recreate the database, then re-run migrate and seed.

**Wrong Node version / unexpected build errors**
Run `nvm use` (or `nvm install`) so the shell is on `22.13.1`, then reinstall:
`rm -rf node_modules && npm install`.

**Stale build artifacts**
Delete the Next.js cache and rebuild: `rm -rf .next && npm run dev`.

**An integration is returning fake data**
That is expected in mock mode. The app runs entirely on labelled mock adapters
until you set `AVOKADO_MODE=live` **and** provide that integration's real
credentials.

**Reset the database from scratch**

```sh
dropdb avokado_dev && createdb avokado_dev
npm run db:migrate && npm run db:seed
```
