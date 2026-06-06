import { NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";
import { rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Nano Banana (Gemini 2.5 Flash Image) ad-creative generator.
 *
 * Generates a single photographic ad creative on the spot from the brand +
 * concept, returned as a base64 data URL. The client overlays the Meta/feed
 * chrome around it.
 *
 * Key handling: uses the Gemini Developer API key (GEMINI_API_KEY). The key is
 * a real server secret — never hardcoded, never sent to the browser. When no
 * key is configured the route returns { image: null } so the UI falls back to
 * the branded gradient and the app still builds/deploys without it. We do NOT
 * use the Vertex service-account path (those credentials are out of scope).
 */

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

// Nano Banana model ids, tried in order (GA first, then preview).
const MODELS = [
  process.env.NANO_BANANA_MODEL,
  "gemini-2.5-flash-image",
  "gemini-2.5-flash-image-preview",
].filter((m): m is string => Boolean(m));

// Small in-memory cache so the 3 concepts (and reloads) don't re-bill.
const cache = new Map<string, string>();
const CACHE_MAX = 60;

interface Body {
  company?: string;
  summary?: string;
  category?: string;
  keywords?: string[];
  primaryHex?: string;
  concept?: { name?: string; angle?: string; format?: string; headline?: string };
}

function buildPrompt(b: Body): string {
  const c = b.concept ?? {};
  return [
    "Photorealistic advertising creative for a Facebook and Instagram feed ad.",
    b.company ? `Brand: ${b.company}.` : "",
    b.summary ? b.summary : "",
    c.name ? `Creative concept: "${c.name}"${c.angle ? ` — ${c.angle}` : ""}.` : "",
    b.keywords?.length ? `Visual cues: ${b.keywords.slice(0, 6).join(", ")}.` : "",
    "Style: premium modern editorial product and lifestyle photography, natural soft lighting, shallow depth of field, crisp detail, uncluttered composition with generous negative space.",
    b.primaryHex ? `Subtly harmonize the palette with the brand color ${b.primaryHex}.` : "",
    "Strictly no text, no words, no letters, no logos, no watermarks, no UI, no borders. One clean photographic image. Vertical 4:5 composition.",
  ]
    .filter(Boolean)
    .join(" ");
}

export async function POST(request: Request) {
  if (!API_KEY) {
    return NextResponse.json({ image: null, reason: "no-key" });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anon";
  const rl = rateLimit(`creative-image:${ip}`, { limit: 20, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json({ image: null, reason: "rate-limited" }, { status: 429 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ image: null, reason: "bad-request" }, { status: 400 });
  }

  const prompt = buildPrompt(body);
  const cached = cache.get(prompt);
  if (cached) return NextResponse.json({ image: cached, cached: true });

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  let lastReason = "no-image";

  for (const model of MODELS) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: prompt,
        config: { responseModalities: [Modality.IMAGE] },
      });
      const parts = res?.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        const inline = part.inlineData;
        if (inline?.data) {
          const dataUrl = `data:${inline.mimeType || "image/png"};base64,${inline.data}`;
          if (cache.size >= CACHE_MAX) {
            const first = cache.keys().next().value;
            if (first) cache.delete(first);
          }
          cache.set(prompt, dataUrl);
          return NextResponse.json({ image: dataUrl, model });
        }
      }
      lastReason = "no-image";
    } catch (err) {
      lastReason = err instanceof Error ? err.message : "error";
      // Try the next model id (e.g. GA name unavailable → preview).
    }
  }

  return NextResponse.json({ image: null, reason: lastReason });
}
