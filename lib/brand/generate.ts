import type {
  AdPlan,
  AdStrategy,
  BrandPreview,
  CampaignPlan,
  CreativeConcept,
  PaletteSwatch,
  SiteInspection,
} from "./types";

/* ------------------------------- color helpers ----------------------------- */

function parseHex(hex: string): [number, number, number] | null {
  const m = hex.trim().replace("#", "");
  if (![3, 6].includes(m.length)) return null;
  const full =
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m;
  const n = Number.parseInt(full, 16);
  if (Number.isNaN(n)) return null;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: [number, number, number]): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function mix(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

const DEFAULT_PALETTE: PaletteSwatch[] = [
  { name: "Primary", hex: "#3f7d44" },
  { name: "Accent", hex: "#1f9d8a" },
  { name: "Ink", hex: "#141414" },
  { name: "Paper", hex: "#f5f3ee" },
  { name: "Muted", hex: "#8a8a82" },
];

function derivePalette(themeColor: string | null): PaletteSwatch[] {
  const rgb = themeColor ? parseHex(themeColor) : null;
  if (!rgb) return DEFAULT_PALETTE;
  const white: [number, number, number] = [255, 255, 255];
  const black: [number, number, number] = [12, 12, 12];
  return [
    { name: "Primary", hex: toHex(rgb) },
    { name: "Tint", hex: toHex(mix(rgb, white, 0.45)) },
    { name: "Shade", hex: toHex(mix(rgb, black, 0.4)) },
    { name: "Ink", hex: "#141414" },
    { name: "Paper", hex: "#f6f4ef" },
  ];
}

/* ------------------------------- text helpers ------------------------------ */

const SUFFIXES = /\s*[|–\-·:]\s*(home|official\s*(store|site)?|shop|store|ecommerce|the official).*$/i;

function companyFromInspection(insp: SiteInspection): string {
  if (insp.siteName) return insp.siteName.replace(SUFFIXES, "").trim();
  if (insp.title) {
    const first = insp.title.split(/[|–\-·]/)[0].trim();
    if (first.length >= 2) return first;
  }
  const base = insp.domain.split(".")[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function firstSentence(text: string): string {
  const s = text.split(/(?<=[.!?])\s/)[0];
  return s.length > 110 ? s.slice(0, 107).trimEnd() + "…" : s;
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* --------------------------------- builder --------------------------------- */

/**
 * Build a preview brand book from a site inspection using deterministic
 * heuristics over the page's real signals (name, copy, CTAs, colors). This is a
 * fast, no-login preview; the full brand book is generated with Vertex AI inside
 * the workspace once you sign up.
 */
export function buildBrandPreview(insp: SiteInspection): BrandPreview {
  const companyName = companyFromInspection(insp);

  const tagline = insp.description
    ? firstSentence(insp.description)
    : insp.headings[0]
      ? firstSentence(insp.headings[0])
      : `Thoughtfully made products from ${companyName}.`;

  const summary =
    insp.description ??
    [
      `${companyName} is an ecommerce brand.`,
      insp.headings.slice(0, 2).join(". "),
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

  const valueProps = (insp.ctas.length >= 2 ? insp.ctas : insp.headings.slice(1))
    .map(titleCase)
    .slice(0, 4);

  const keywords =
    insp.keywords.length > 0
      ? insp.keywords.slice(0, 8)
      : insp.headings
          .join(" ")
          .toLowerCase()
          .match(/\b[a-z]{4,}\b/g)
          ?.filter(
            (w, i, arr) =>
              arr.indexOf(w) === i &&
              !["that", "with", "your", "from", "this", "more", "shop", "home"].includes(w),
          )
          .slice(0, 8) ?? [];

  return {
    url: insp.finalUrl,
    domain: insp.domain,
    companyName,
    tagline,
    summary: summary || `${companyName} — discover more at ${insp.domain}.`,
    audience: [
      "Existing customers ready to re-purchase",
      "Lookalikes of your best buyers",
      "Visitors who browsed but didn't convert",
    ],
    voice: ["Confident", "Warm", "Clear", "Product-first"],
    valueProps: valueProps.length ? valueProps : ["Quality you can feel", "Made to last"],
    palette: derivePalette(insp.themeColor),
    keywords,
    ogImage: insp.ogImage,
    source: "heuristic",
  };
}

/* ------------------------------ full ad plan ------------------------------- */

function buildStrategy(brand: BrandPreview): AdStrategy {
  const vp = brand.valueProps;
  return {
    objective: "Sales — new-customer acquisition",
    angles: [
      {
        title: "Why people choose " + brand.companyName,
        hook: brand.tagline,
        audience: "Cold prospects who resemble your best buyers",
      },
      {
        title: "Lead with the offer",
        hook: vp[0] ? `${vp[0]} — and a reason to buy today.` : "A reason to buy today.",
        audience: "Engaged shoppers and recent site visitors",
      },
      {
        title: "Earn trust with proof",
        hook: `Real customers, real results from ${brand.companyName}.`,
        audience: "Lookalikes of your purchasers",
      },
    ],
    audiences: brand.audience,
    dailyBudget: 30,
    currency: "EUR",
    testingPlan:
      "Start with 3 concepts at a small daily budget. After enough data, pause the weakest and shift budget to the winners — only with your approval.",
  };
}

function buildCreatives(brand: BrandPreview): CreativeConcept[] {
  const [vp1, vp2] = brand.valueProps;
  return [
    {
      name: "Value-led prospecting",
      angle: "Why people choose " + brand.companyName,
      format: "Single image / video",
      primaryText: `${brand.tagline} ${vp1 ? vp1 + ". " : ""}See why customers keep coming back to ${brand.companyName}.`,
      headline: vp1 ? vp1 : `Meet ${brand.companyName}`,
      description: `Discover ${brand.companyName}.`,
      cta: "Shop Now",
    },
    {
      name: "Offer / first-order",
      angle: "Lead with the offer",
      format: "Single image",
      primaryText: `Ready to try ${brand.companyName}? ${vp2 ?? vp1 ?? "Loved by our customers"}. Tap to shop today.`,
      headline: `Shop ${brand.companyName}`,
      description: "Limited-time welcome offer.",
      cta: "Shop Now",
    },
    {
      name: "Social proof / UGC",
      angle: "Earn trust with proof",
      format: "UGC video",
      primaryText: `“${brand.tagline}” — join the customers who made the switch to ${brand.companyName}.`,
      headline: `Real results from ${brand.companyName}`,
      description: "What our customers say.",
      cta: "Learn More",
    },
  ];
}

function buildCampaign(brand: BrandPreview, strategy: AdStrategy): CampaignPlan {
  return {
    name: `${brand.companyName} — Prospecting`,
    objective: strategy.objective,
    status: "draft",
    dailyBudget: strategy.dailyBudget,
    currency: strategy.currency,
    adSets: [
      { name: "Broad", audience: "Advantage+ broad targeting", optimization: "Purchase", ads: 3 },
      { name: "Interests", audience: "Category & competitor interests", optimization: "Purchase", ads: 3 },
      { name: "Lookalike 1%", audience: "Lookalike of past purchasers", optimization: "Purchase", ads: 2 },
    ],
  };
}

/**
 * Build the full, automatically-generated advertising plan from a brand preview.
 * Deterministic for the no-login demo; the in-app version regenerates each stage
 * with Vertex AI and ties it to your real products and Meta account.
 */
export function buildAdPlan(brand: BrandPreview): AdPlan {
  const strategy = buildStrategy(brand);
  const creatives = buildCreatives(brand);
  const campaign = buildCampaign(brand, strategy);
  return { brand, strategy, creatives, campaign };
}
