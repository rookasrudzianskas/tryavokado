# Avokado

The creative operating system for ecommerce advertising — at
[tryavokado.com](https://tryavokado.com).

Avokado connects a brand's store, learns its products and identity, generates an
editable brand book, builds Meta campaign drafts from real products and approved
assets, and recommends improvements — with safety and approval controls at every
step.

> **Draft-first, approval-required, mock-by-default.** Avokado never silently
> spends money or launches campaigns, and it runs end-to-end with **zero**
> third-party credentials thanks to labelled mock adapters.

## Tech stack

Next.js 16 (App Router, RSC) · TypeScript (strict) · Tailwind v4 + custom shadcn
primitives · TanStack Query/Table · Framer Motion · PostgreSQL + Drizzle ORM ·
Better Auth · Zod · Inngest · Cloudflare R2 (S3) · Stripe · Google Vertex AI ·
Resend · Sentry · PostHog · Vitest + Playwright.

## Quick start

```bash
# 1. Use the pinned Node version
nvm use            # 22.13.1 (.nvmrc)

# 2. Install dependencies
npm install

# 3. Configure env (copy and fill — never commit .env.local)
cp .env.example .env.local
#    Generate secrets:
#    openssl rand -base64 32   # BETTER_AUTH_SECRET and ENCRYPTION_KEY

# 4. Create the database and run migrations
createdb avokado_dev
npm run db:migrate

# 5. (Optional) seed demo data
npm run db:seed

# 6. Run
npm run dev        # http://localhost:3000
```

Avokado starts in **mock mode** (`AVOKADO_MODE=mock`). Every integration uses a
clearly-labelled mock adapter until you provide real credentials and switch
`AVOKADO_MODE=live`.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run format` | Prettier |
| `npm run db:generate` / `db:migrate` / `db:studio` | Drizzle migrations & studio |
| `npm run db:seed` | Seed demo data |
| `npm run test` / `test:watch` | Vitest |
| `npm run test:e2e` | Playwright |
| `npm run check` | typecheck + lint + unit tests |

## Documentation

- [`docs/build-plan.md`](docs/build-plan.md) — phase plan & status
- [`docs/architecture.md`](docs/architecture.md) — system architecture
- [`docs/local-development.md`](docs/local-development.md) — local setup
- [`docs/security.md`](docs/security.md) — security model
- [`docs/mock-mode.md`](docs/mock-mode.md) — how mock mode works
- Integration setup: `docs/google-vertex-setup.md`, `docs/shopify-setup.md`,
  `docs/woocommerce-setup.md`, `docs/meta-setup.md`,
  `docs/meta-mcp-vs-marketing-api.md`
- [`docs/background-jobs.md`](docs/background-jobs.md),
  [`docs/testing.md`](docs/testing.md), [`docs/deployment.md`](docs/deployment.md)

## License

Proprietary. © Avokado.
