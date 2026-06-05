/**
 * Client-safe environment. Only `NEXT_PUBLIC_*` values, which Next inlines into
 * the browser bundle. Safe to import from Client Components.
 */
export const publicEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  mode: (process.env.NEXT_PUBLIC_AVOKADO_MODE ?? "mock") as "mock" | "live",
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
} as const;

export const isMockModeClient = publicEnv.mode === "mock";
