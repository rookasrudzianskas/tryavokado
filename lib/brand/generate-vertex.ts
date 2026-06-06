import "server-only";
import { GoogleGenAI } from "@google/genai";
import type { AdPlan, SiteInspection } from "./types";
import { buildAdPlan, buildBrandPreview } from "./generate";

/**
 * Generate the full advertising plan (brand book + strategy + creatives +
 * campaign) with Gemini on Vertex AI. Returns null when Vertex isn't configured
 * or generation fails, so the caller falls back to the deterministic builder.
 *
 * Vertex activates ONLY with an explicit inline service-account credential
 * (GOOGLE_VERTEX_CREDENTIALS) — never ambient ADC — so no pre-existing or
 * flagged key on the host is ever used.
 */

type GenAIOptions = ConstructorParameters<typeof GoogleGenAI>[0];

function makeVertexClient(): GoogleGenAI | null {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const credsJson = process.env.GOOGLE_VERTEX_CREDENTIALS;
  if (!project || !credsJson) return null;
  try {
    const credentials = JSON.parse(credsJson) as Record<string, unknown>;
    const options: GenAIOptions = {
      vertexai: true,
      project,
      location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
    };
    (options as { googleAuthOptions?: { credentials?: unknown } }).googleAuthOptions =
      { credentials };
    return new GoogleGenAI(options);
  } catch {
    return null;
  }
}

function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}
function str(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}
function strArr(v: unknown, fallback: string[]): string[] {
  if (Array.isArray(v)) {
    const arr = v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
    if (arr.length) return arr;
  }
  return fallback;
}
function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

export async function generateAdPlanWithVertex(
  insp: SiteInspection,
): Promise<AdPlan | null> {
  const ai = makeVertexClient();
  if (!ai) return null;

  // Heuristic scaffold — keeps the palette/colors and guarantees valid shape
  // even if the model omits a field.
  const base = buildAdPlan(buildBrandPreview(insp));
  const model = process.env.VERTEX_TEXT_MODEL || "gemini-2.5-flash";

  const prompt = [
    "You are a senior brand strategist and Meta (Facebook/Instagram) performance marketer.",
    "Using ONLY the scraped homepage data below, write a specific, on-brand advertising plan for THIS store.",
    "Be concrete and reference the real brand, products and audience — no generic filler. Currency is EUR; suggested daily budget is 30.",
    "",
    "SCRAPED DATA:",
    JSON.stringify({
      domain: insp.domain,
      title: insp.title,
      description: insp.description,
      siteName: insp.siteName,
      headings: insp.headings,
      ctas: insp.ctas,
      keywords: insp.keywords,
    }),
    "",
    "Return ONLY JSON with this exact shape:",
    `{
  "companyName": string,
  "tagline": string,               // <= 110 chars
  "summary": string,               // 1-2 sentences
  "audience": [string, string, string],
  "voice": [string, string, string, string],
  "valueProps": [string, string, string],
  "strategy": {
    "objective": string,
    "testingPlan": string,
    "angles": [ {"title": string, "hook": string, "audience": string} ]   // exactly 3
  },
  "creatives": [ {"name": string, "angle": string, "format": string, "primaryText": string, "headline": string, "description": string, "cta": string} ],  // exactly 3
  "campaign": {
    "name": string,
    "objective": string,
    "adSets": [ {"name": string, "audience": string, "optimization": string, "ads": number} ]   // exactly 3
  }
}`,
  ].join("\n");

  let data: Record<string, unknown>;
  try {
    const res = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.6 },
    });
    const text = res.text ?? "";
    data = obj(JSON.parse(text));
  } catch {
    return null; // caller falls back to the deterministic plan
  }

  try {
    const s = obj(data.strategy);
    const angles = Array.isArray(s.angles) ? s.angles : [];
    const creatives = Array.isArray(data.creatives) ? data.creatives : [];
    const camp = obj(data.campaign);
    const adSets = Array.isArray(camp.adSets) ? camp.adSets : [];

    return {
      brand: {
        ...base.brand,
        companyName: str(data.companyName, base.brand.companyName),
        tagline: str(data.tagline, base.brand.tagline),
        summary: str(data.summary, base.brand.summary),
        audience: strArr(data.audience, base.brand.audience),
        voice: strArr(data.voice, base.brand.voice),
        valueProps: strArr(data.valueProps, base.brand.valueProps),
        source: "vertex",
      },
      strategy: {
        ...base.strategy,
        objective: str(s.objective, base.strategy.objective),
        testingPlan: str(s.testingPlan, base.strategy.testingPlan),
        angles:
          angles.length > 0
            ? angles.slice(0, 3).map((a, i) => {
                const o = obj(a);
                const fb = base.strategy.angles[i];
                return {
                  title: str(o.title, fb?.title ?? "Angle"),
                  hook: str(o.hook, fb?.hook ?? ""),
                  audience: str(o.audience, fb?.audience ?? ""),
                };
              })
            : base.strategy.angles,
      },
      creatives:
        creatives.length > 0
          ? creatives.slice(0, 3).map((c, i) => {
              const o = obj(c);
              const fb = base.creatives[i];
              return {
                name: str(o.name, fb?.name ?? "Concept"),
                angle: str(o.angle, fb?.angle ?? ""),
                format: str(o.format, fb?.format ?? "Single image"),
                primaryText: str(o.primaryText, fb?.primaryText ?? ""),
                headline: str(o.headline, fb?.headline ?? ""),
                description: str(o.description, fb?.description ?? ""),
                cta: str(o.cta, fb?.cta ?? "Shop Now"),
              };
            })
          : base.creatives,
      campaign: {
        ...base.campaign,
        name: str(camp.name, base.campaign.name),
        objective: str(camp.objective, base.campaign.objective),
        adSets:
          adSets.length > 0
            ? adSets.slice(0, 3).map((a, i) => {
                const o = obj(a);
                const fb = base.campaign.adSets[i];
                return {
                  name: str(o.name, fb?.name ?? "Ad set"),
                  audience: str(o.audience, fb?.audience ?? ""),
                  optimization: str(o.optimization, fb?.optimization ?? "Purchase"),
                  ads: num(o.ads, fb?.ads ?? 3),
                };
              })
            : base.campaign.adSets,
      },
    };
  } catch {
    return null;
  }
}
