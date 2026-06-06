import { NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";
import { rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Nano Banana (Gemini 2.5 Flash Image) ad-creative generator — Vertex AI.
 *
 * Generates a single photographic ad creative on the spot from the brand +
 * concept, returned as a base64 data URL. The client overlays the Meta/feed
 * chrome around it.
 *
 * Auth: Vertex AI via Application Default Credentials.
 *   - GOOGLE_GENAI_USE_VERTEXAI=true, GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION
 *   - Credentials come from ADC: `gcloud auth application-default login` for
 *     local dev, or a service-account JSON passed inline via
 *     GOOGLE_VERTEX_CREDENTIALS (used on Vercel — a real secret, never
 *     committed). We never read or embed any key in source.
 *   - Falls back to the Gemini Developer API (GEMINI_API_KEY) only if Vertex
 *     isn't configured.
 * When no credentials resolve, generation throws and the route returns
 * { image: null } so the UI shows the branded gradient and the app still
 * builds and deploys.
 */

// Nano Banana model ids, tried in order (GA first, then preview).
const MODELS = [
  process.env.NANO_BANANA_MODEL,
  "gemini-2.5-flash-image",
  "gemini-2.5-flash-image-preview",
].filter((m): m is string => Boolean(m));

// Small in-memory cache so the 3 concepts (and reloads) don't re-bill.
const cache = new Map<string, string>();
const CACHE_MAX = 60;

type GenAIOptions = ConstructorParameters<typeof GoogleGenAI>[0];

function makeClient(): GoogleGenAI | null {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
  const useVertex = process.env.GOOGLE_GENAI_USE_VERTEXAI !== "false" && !!project;

  if (useVertex) {
    const options: GenAIOptions = { vertexai: true, project, location };
    // Optional inline service-account JSON (Vercel / headless). Never logged.
    const credsJson = process.env.GOOGLE_VERTEX_CREDENTIALS;
    if (credsJson) {
      try {
        const credentials = JSON.parse(credsJson) as Record<string, unknown>;
        (options as { googleAuthOptions?: { credentials?: unknown } }).googleAuthOptions =
          { credentials };
      } catch {
        // Malformed inline creds — fall through to default ADC discovery.
      }
    }
    return new GoogleGenAI(options);
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
}

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
  const ai = makeClient();
  if (!ai) {
    return NextResponse.json({ image: null, reason: "no-credentials" });
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
