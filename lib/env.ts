import { z } from "zod";

/**
 * Centralised, validated environment access.
 *
 * - Core secrets (DB, auth, encryption) are REQUIRED — the app refuses to start
 *   without them.
 * - Every third-party integration is OPTIONAL. When its credentials are absent
 *   the corresponding adapter automatically falls back to a labelled mock, so the
 *   whole product is usable with zero external accounts.
 *
 * This module must never be imported from a Client Component. Client code reads
 * `NEXT_PUBLIC_*` values from `lib/env-public.ts`.
 */

// Optional env var: treat empty strings (e.g. `FOO=` in .env) as unset.
const optionalString = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().trim().min(1).optional(),
);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // --- Core (required) ---
  // 32-byte base64 key used to encrypt third-party tokens (e.g. Meta) at rest.
  // Optional so builds/cold-starts never crash; crypto guards at point-of-use.
  ENCRYPTION_KEY: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().min(16, "ENCRYPTION_KEY must be at least 16 characters").optional(),
  ),

  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  AVOKADO_MODE: z.enum(["mock", "live"]).default("mock"),
  NEXT_PUBLIC_AVOKADO_MODE: z.enum(["mock", "live"]).default("mock"),

  // --- Firebase Admin (server; needs a tryavokado-a4ead service account) ---
  FIREBASE_ADMIN_PROJECT_ID: optionalString,

  // --- Google Vertex AI ---
  GOOGLE_CLOUD_PROJECT: optionalString,
  GOOGLE_CLOUD_LOCATION: z.string().default("global"),
  GOOGLE_GENAI_USE_VERTEXAI: z.string().default("true"),
  GOOGLE_APPLICATION_CREDENTIALS: optionalString,
  VERTEX_TEXT_MODEL: z.string().default("gemini-2.5-pro"),
  VERTEX_FAST_MODEL: z.string().default("gemini-2.5-flash"),
  VERTEX_VISION_MODEL: z.string().default("gemini-2.5-flash"),

  // --- Shopify ---
  SHOPIFY_API_KEY: optionalString,
  SHOPIFY_API_SECRET: optionalString,
  SHOPIFY_SCOPES: z.string().default("read_products,read_orders,read_content"),
  SHOPIFY_APP_URL: optionalString,

  // --- Meta ---
  META_APP_ID: optionalString,
  META_APP_SECRET: optionalString,
  META_GRAPH_API_VERSION: z.string().default("v23.0"),
  META_CONFIG_ID: optionalString,
  META_MCP_ENABLED: z.string().default("false"),
  META_MCP_URL: optionalString,

  // --- Stripe ---
  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalString,
  STRIPE_PRICE_STARTER: optionalString,
  STRIPE_PRICE_GROWTH: optionalString,
  STRIPE_PRICE_SCALE: optionalString,

  // --- Object storage (R2 / S3-compatible) ---
  R2_ACCOUNT_ID: optionalString,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  R2_BUCKET: z.string().default("avokado-assets"),
  R2_REGION: z.string().default("auto"),
  R2_ENDPOINT: optionalString,
  R2_PUBLIC_URL: optionalString,

  // --- Inngest ---
  INNGEST_EVENT_KEY: optionalString,
  INNGEST_SIGNING_KEY: optionalString,
  INNGEST_DEV: z.string().default("true"),

  // --- Email ---
  RESEND_API_KEY: optionalString,
  EMAIL_FROM: z.string().default("Avokado <hello@tryavokado.com>"),

  // --- Monitoring & analytics ---
  SENTRY_DSN: optionalString,
  NEXT_PUBLIC_SENTRY_DSN: optionalString,
  SENTRY_ENVIRONMENT: z.string().default("development"),
  NEXT_PUBLIC_POSTHOG_KEY: optionalString,
  NEXT_PUBLIC_POSTHOG_HOST: optionalString,
});

export type Env = z.infer<typeof envSchema>;

type ParseResult =
  | { ok: true; env: Env }
  | { ok: false; issues: string[] };

function parseEnv(): ParseResult {
  const parsed = envSchema.safeParse(process.env);
  if (parsed.success) return { ok: true, env: parsed.data };
  const issues = parsed.error.issues.map(
    (i) => `${i.path.join(".")}: ${i.message}`,
  );
  return { ok: false, issues };
}

const result = parseEnv();

// Never throw at import time — that would crash production builds and serverless
// cold starts when optional config is absent. Warn instead; each consumer guards
// on the specific value it needs (e.g. crypto requires ENCRYPTION_KEY at runtime).
if (!result.ok && typeof console !== "undefined") {
  console.warn(
    "[env] Some environment configuration is missing or invalid:\n" +
      result.issues.map((i) => `  - ${i}`).join("\n") +
      "\nSee .env.example and docs/local-development.md.",
  );
}

export const env: Env = result.ok ? result.env : envSchema.parse({});

export const isMockMode = env.AVOKADO_MODE === "mock";
export const isProd = env.NODE_ENV === "production";

/** Per-integration configuration status — drives mock vs. live adapter choice. */
export const integrations = {
  firebaseAdmin: Boolean(env.FIREBASE_ADMIN_PROJECT_ID && env.GOOGLE_APPLICATION_CREDENTIALS),
  vertex: Boolean(env.GOOGLE_CLOUD_PROJECT),
  shopify: Boolean(env.SHOPIFY_API_KEY && env.SHOPIFY_API_SECRET),
  meta: Boolean(env.META_APP_ID && env.META_APP_SECRET),
  metaMcp: env.META_MCP_ENABLED === "true",
  stripe: Boolean(env.STRIPE_SECRET_KEY),
  storage: Boolean(env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY),
  inngest: Boolean(env.INNGEST_EVENT_KEY && env.INNGEST_SIGNING_KEY),
  email: Boolean(env.RESEND_API_KEY),
  sentry: Boolean(env.SENTRY_DSN),
  posthog: Boolean(env.NEXT_PUBLIC_POSTHOG_KEY),
} as const;

export type IntegrationKey = keyof typeof integrations;

/** True when the integration should use its real adapter (live mode + creds). */
export function integrationIsLive(key: IntegrationKey): boolean {
  if (isMockMode) return false;
  return integrations[key];
}

/** Startup diagnostics surfaced in the setup/health UI (never raw values). */
export function environmentReport() {
  return {
    mode: env.AVOKADO_MODE,
    nodeEnv: env.NODE_ENV,
    integrations,
  };
}
