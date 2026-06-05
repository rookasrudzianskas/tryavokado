import type {
  MetaAdAccount,
  MetaBusiness,
  MetaCatalog,
  MetaInsightRow,
  MetaInstagramAccount,
  MetaPage,
  MetaPermission,
  MetaPixel,
  MetaReadiness,
  OrderSummary,
  StoreCollection,
  StoreMetadata,
  StoreProduct,
} from "@/lib/integrations/types";

/**
 * Deterministic demo dataset for a fictional brand, "Marlowe Coffee Co.".
 * Always surfaced behind clear "Demo data" labels and never mixed with real data.
 */

export const DEMO_BRAND_NAME = "Marlowe Coffee Co.";
export const DEMO_DOMAIN = "marlowecoffee.example";

function img(seed: string) {
  return `https://picsum.photos/seed/${seed}/900/900`;
}

export const DEMO_STORE: StoreMetadata = {
  name: DEMO_BRAND_NAME,
  domain: DEMO_DOMAIN,
  description:
    "Small-batch specialty coffee roasted in Portland. Direct-trade beans, recyclable packaging, and a subscription loved by home baristas.",
  currency: "USD",
  country: "US",
  primaryColorHints: ["#2f4a2f", "#c98a3c", "#f4efe6"],
};

export const DEMO_PRODUCTS: StoreProduct[] = [
  {
    externalId: "demo-prod-1",
    title: "Midnight Harbor Dark Roast",
    handle: "midnight-harbor-dark-roast",
    description:
      "A bold, low-acidity dark roast with notes of cocoa and toasted walnut. Our best seller for espresso.",
    status: "active",
    vendor: DEMO_BRAND_NAME,
    productType: "Whole bean coffee",
    tags: ["dark-roast", "espresso", "bestseller"],
    priceMin: 18,
    priceMax: 42,
    currency: "USD",
    images: [{ url: img("coffee-dark"), alt: "Bag of dark roast coffee" }],
    featuredImageUrl: img("coffee-dark"),
    variants: [
      { externalId: "v1a", title: "12 oz", sku: "MH-12", price: 18, available: true, inventoryQuantity: 240, options: { size: "12 oz" } },
      { externalId: "v1b", title: "2 lb", sku: "MH-32", price: 42, available: true, inventoryQuantity: 90, options: { size: "2 lb" } },
    ],
  },
  {
    externalId: "demo-prod-2",
    title: "Golden Hour Light Roast",
    handle: "golden-hour-light-roast",
    description:
      "Bright and floral with notes of citrus and honey. A single-origin Ethiopian for pour-over lovers.",
    status: "active",
    vendor: DEMO_BRAND_NAME,
    productType: "Whole bean coffee",
    tags: ["light-roast", "single-origin", "pour-over"],
    priceMin: 20,
    priceMax: 46,
    currency: "USD",
    images: [{ url: img("coffee-light"), alt: "Bag of light roast coffee" }],
    featuredImageUrl: img("coffee-light"),
    variants: [
      { externalId: "v2a", title: "12 oz", sku: "GH-12", price: 20, available: true, inventoryQuantity: 180, options: { size: "12 oz" } },
      { externalId: "v2b", title: "2 lb", sku: "GH-32", price: 46, available: true, inventoryQuantity: 60, options: { size: "2 lb" } },
    ],
  },
  {
    externalId: "demo-prod-3",
    title: "The Daily Ritual Subscription",
    handle: "daily-ritual-subscription",
    description:
      "Freshly roasted coffee delivered on your schedule. Pause or cancel anytime. The highest-margin product we offer.",
    status: "active",
    vendor: DEMO_BRAND_NAME,
    productType: "Subscription",
    tags: ["subscription", "recurring", "hero"],
    priceMin: 16,
    priceMax: 38,
    currency: "USD",
    images: [{ url: img("coffee-sub"), alt: "Coffee subscription box" }],
    featuredImageUrl: img("coffee-sub"),
    variants: [
      { externalId: "v3a", title: "Every 2 weeks", sku: "SUB-2W", price: 16, available: true, options: { cadence: "2 weeks" } },
      { externalId: "v3b", title: "Monthly", sku: "SUB-1M", price: 38, available: true, options: { cadence: "monthly" } },
    ],
  },
  {
    externalId: "demo-prod-4",
    title: "Ceramic Pour-Over Set",
    handle: "ceramic-pour-over-set",
    description:
      "A handmade ceramic dripper and carafe. The perfect upsell for new light-roast customers.",
    status: "active",
    vendor: DEMO_BRAND_NAME,
    productType: "Equipment",
    tags: ["equipment", "upsell", "gift"],
    priceMin: 54,
    priceMax: 54,
    currency: "USD",
    images: [{ url: img("pourover"), alt: "Ceramic pour-over set" }],
    featuredImageUrl: img("pourover"),
    variants: [
      { externalId: "v4a", title: "Sage", sku: "PO-SAGE", price: 54, available: true, inventoryQuantity: 40, options: { color: "Sage" } },
      { externalId: "v4b", title: "Cream", sku: "PO-CREAM", price: 54, available: false, inventoryQuantity: 0, options: { color: "Cream" } },
    ],
  },
  {
    externalId: "demo-prod-5",
    title: "Cold Brew Concentrate",
    handle: "cold-brew-concentrate",
    description:
      "Steeped 18 hours for a smooth, naturally sweet cold brew. Just add water or milk.",
    status: "active",
    vendor: DEMO_BRAND_NAME,
    productType: "Ready to drink",
    tags: ["cold-brew", "summer"],
    priceMin: 24,
    priceMax: 24,
    currency: "USD",
    images: [{ url: img("coldbrew"), alt: "Cold brew concentrate bottle" }],
    featuredImageUrl: img("coldbrew"),
    variants: [
      { externalId: "v5a", title: "32 oz", sku: "CB-32", price: 24, available: true, inventoryQuantity: 120, options: { size: "32 oz" } },
    ],
  },
  {
    externalId: "demo-prod-6",
    title: "Marlowe Enamel Mug",
    handle: "marlowe-enamel-mug",
    description: "A durable 12 oz enamel camp mug with our harbor logo. Great for retargeting and gifting.",
    status: "active",
    vendor: DEMO_BRAND_NAME,
    productType: "Merch",
    tags: ["merch", "gift", "retargeting"],
    priceMin: 19,
    priceMax: 19,
    currency: "USD",
    images: [{ url: img("mug"), alt: "Enamel coffee mug" }],
    featuredImageUrl: img("mug"),
    variants: [
      { externalId: "v6a", title: "Harbor Green", sku: "MUG-GRN", price: 19, available: true, inventoryQuantity: 200, options: { color: "Harbor Green" } },
    ],
  },
];

export const DEMO_COLLECTIONS: StoreCollection[] = [
  {
    externalId: "demo-col-1",
    title: "Coffee",
    handle: "coffee",
    description: "Whole bean and ground coffee.",
    imageUrl: img("coffee-dark"),
    productExternalIds: ["demo-prod-1", "demo-prod-2", "demo-prod-5"],
  },
  {
    externalId: "demo-col-2",
    title: "Subscriptions",
    handle: "subscriptions",
    description: "Recurring coffee delivery.",
    imageUrl: img("coffee-sub"),
    productExternalIds: ["demo-prod-3"],
  },
  {
    externalId: "demo-col-3",
    title: "Gear & gifts",
    handle: "gear-and-gifts",
    description: "Equipment and merch.",
    imageUrl: img("pourover"),
    productExternalIds: ["demo-prod-4", "demo-prod-6"],
  },
];

export const DEMO_ORDER_SUMMARY: OrderSummary = {
  available: true,
  currency: "USD",
  last30dRevenue: 48250,
  last30dOrders: 1340,
  averageOrderValue: 36,
};

// --- Meta ---

export const DEMO_META_BUSINESSES: MetaBusiness[] = [
  { externalId: "demo-bm-1", name: "Marlowe Coffee (Business)" },
];
export const DEMO_META_AD_ACCOUNTS: MetaAdAccount[] = [
  {
    externalId: "act_demo_1001",
    name: "Marlowe Coffee — Primary",
    currency: "USD",
    timezone: "America/Los_Angeles",
    accountStatus: "ACTIVE",
    disableReason: null,
    fundingReady: true,
  },
];
export const DEMO_META_PAGES: MetaPage[] = [
  { externalId: "demo-page-1", name: "Marlowe Coffee Co.", category: "Coffee shop" },
];
export const DEMO_META_INSTAGRAM: MetaInstagramAccount[] = [
  { externalId: "demo-ig-1", username: "marlowecoffee", pageExternalId: "demo-page-1" },
];
export const DEMO_META_PIXELS: MetaPixel[] = [
  { externalId: "demo-pixel-1", name: "Marlowe Coffee Pixel", lastFiredAt: "2026-06-05T09:12:00Z" },
];
export const DEMO_META_CATALOGS: MetaCatalog[] = [
  { externalId: "demo-cat-1", name: "Marlowe Coffee Catalog", productCount: 6 },
];
export const DEMO_META_PERMISSIONS: MetaPermission[] = [
  { permission: "ads_management", granted: true },
  { permission: "ads_read", granted: true },
  { permission: "business_management", granted: true },
  { permission: "pages_read_engagement", granted: true },
  { permission: "instagram_basic", granted: true },
];
export const DEMO_META_READINESS: MetaReadiness = {
  ready: true,
  score: 92,
  currency: "USD",
  timezone: "America/Los_Angeles",
  fundingReady: true,
  accountStatus: "ACTIVE",
  restrictions: [],
  missingSteps: [],
};

/** Deterministic ~organic daily account-level insights for the last `days` days. */
export function buildDemoInsights(days = 30, endDateIso?: string): MetaInsightRow[] {
  const end = endDateIso ? new Date(endDateIso) : new Date("2026-06-05T00:00:00Z");
  const rows: MetaInsightRow[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - i);
    // Smooth deterministic wave + slight upward trend.
    const wave = Math.sin(i / 3) * 0.18 + Math.sin(i / 7) * 0.1;
    const trend = 1 + (days - i) / (days * 6);
    const spend = Math.round((160 + 90 * (1 + wave)) * trend);
    const roas = 2.6 + 0.6 * Math.sin(i / 5) + (days - i) / (days * 10);
    const revenue = Math.round(spend * roas);
    const impressions = Math.round(spend * (38 + 6 * Math.sin(i / 4)));
    const clicks = Math.round(impressions * 0.014);
    const purchases = Math.max(1, Math.round(revenue / 36));
    rows.push({
      date: d.toISOString().slice(0, 10),
      entityType: "account",
      entityId: "act_demo_1001",
      spend,
      revenue,
      impressions,
      reach: Math.round(impressions * 0.72),
      clicks,
      purchases,
      addToCart: Math.round(clicks * 0.22),
      checkouts: Math.round(clicks * 0.12),
    });
  }
  return rows;
}

export function summarizeInsights(rows: MetaInsightRow[]) {
  const sum = rows.reduce(
    (a, r) => ({
      spend: a.spend + r.spend,
      revenue: a.revenue + r.revenue,
      impressions: a.impressions + r.impressions,
      clicks: a.clicks + r.clicks,
      purchases: a.purchases + r.purchases,
    }),
    { spend: 0, revenue: 0, impressions: 0, clicks: 0, purchases: 0 },
  );
  return {
    ...sum,
    roas: sum.spend ? sum.revenue / sum.spend : 0,
    cpa: sum.purchases ? sum.spend / sum.purchases : 0,
    ctr: sum.impressions ? sum.clicks / sum.impressions : 0,
    cpc: sum.clicks ? sum.spend / sum.clicks : 0,
  };
}
