/** Static product configuration shared across the app. */

export const APP_NAME = "Avokado";
export const APP_DOMAIN = "tryavokado.com";
export const APP_TAGLINE = "The creative operating system for ecommerce advertising";
export const APP_DESCRIPTION =
  "Avokado connects your store, learns your brand, builds Meta campaigns from your real products and assets, and recommends improvements — with approval controls at every step.";

/** Workspace roles, ordered most → least privileged. */
export const WORKSPACE_ROLES = ["owner", "admin", "marketer", "analyst", "viewer"] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: "Owner",
  admin: "Admin",
  marketer: "Marketer",
  analyst: "Analyst",
  viewer: "Viewer",
};

export const ROLE_DESCRIPTIONS: Record<WorkspaceRole, string> = {
  owner: "Full control including billing and workspace deletion.",
  admin: "Manage members, integrations, and all campaign actions.",
  marketer: "Build and approve creative, strategy, and campaign drafts.",
  analyst: "View analytics and propose recommendations.",
  viewer: "Read-only access to the workspace.",
};

/** Capability checks per role. Higher roles inherit lower-role capabilities. */
const ROLE_RANK: Record<WorkspaceRole, number> = {
  owner: 100,
  admin: 80,
  marketer: 60,
  analyst: 40,
  viewer: 20,
};

export function roleAtLeast(role: WorkspaceRole, min: WorkspaceRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

export const ECOMMERCE_PLATFORMS = ["shopify", "woocommerce", "website"] as const;
export type EcommercePlatform = (typeof ECOMMERCE_PLATFORMS)[number];

export const PLATFORM_LABELS: Record<EcommercePlatform, string> = {
  shopify: "Shopify",
  woocommerce: "WooCommerce",
  website: "Website only",
};

/** Subscription plans (Avokado billing). */
export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 49,
    highlighted: false,
    blurb: "For founders running their first Meta campaigns.",
    features: [
      "1 connected store",
      "Brand intelligence + brand book",
      "Up to 3 active campaigns",
      "Creative studio",
      "Manual approval on every action",
    ],
    limits: { stores: 1, members: 2, monthlyAdSpend: 5_000 },
  },
  {
    id: "growth",
    name: "Growth",
    priceMonthly: 149,
    highlighted: true,
    blurb: "For brands scaling with structured automation.",
    features: [
      "3 connected stores",
      "Everything in Starter",
      "Unlimited campaign drafts",
      "Safe automation rules",
      "AI performance analyst",
      "Priority brand-book exports",
    ],
    limits: { stores: 3, members: 8, monthlyAdSpend: 50_000 },
  },
  {
    id: "scale",
    name: "Scale",
    priceMonthly: 399,
    highlighted: false,
    blurb: "For agencies and multi-brand operators.",
    features: [
      "Unlimited stores & workspaces",
      "Everything in Growth",
      "Advanced approval workflows",
      "Audit-log exports",
      "SSO (on request)",
      "Dedicated support",
    ],
    limits: { stores: 999, members: 999, monthlyAdSpend: 1_000_000 },
  },
] as const;

export type PlanId = (typeof PLANS)[number]["id"];

export const SUPPORTED_CURRENCIES = ["EUR", "USD", "GBP", "CAD", "AUD"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

/** Avokado bills in euros by default. */
export const DEFAULT_CURRENCY: Currency = "EUR";

/**
 * Connecting a human specialist is a one-time paid handoff. Priced in EUR.
 */
export const HUMAN_HELP_PRICE_EUR = 500;
export const HUMAN_HELP = {
  priceEur: HUMAN_HELP_PRICE_EUR,
  name: "Talk to a human specialist",
  blurb:
    "A senior Avokado ad specialist reviews your account, joins a live chat, and helps you ship — reviewing everything the AI has done so far.",
  includes: [
    "A specialist assigned to your workspace",
    "Full review of AI-generated brand, strategy, and campaigns",
    "Live chat and async messaging",
    "Hands-on help launching your first campaign safely",
  ],
} as const;

/** Safety rails applied by the policy engine regardless of user settings. */
export const SAFETY_LIMITS = {
  maxBudgetIncreasePct: 0.2, // never raise a budget by more than 20% in one action
  minSpendForPauseDecision: 25, // require at least this much spend before pausing on performance
  minImpressionsForDecision: 1_000,
  minConversionsForRoasDecision: 5,
  defaultMaxDailySpend: 500,
} as const;
