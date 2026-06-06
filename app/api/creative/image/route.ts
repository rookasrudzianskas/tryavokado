import { NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";
import { rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Ad-creative image generator. Generates a single photographic ad creative on
 * the spot from the brand + concept, returned as a base64 data URL. The client
 * overlays the Meta/feed chrome around it.
 *
 * Providers, tried in order (first one configured wins):
 *   1. HuggingFace Inference (Flux) — HUGGINGFACE_API_KEY.
 *   2. Replicate (Flux) — REPLICATE_API_TOKEN.
 *   3. Vertex AI / Gemini 2.5 Flash Image (Nano Banana) — Vertex ADC or
 *      GEMINI_API_KEY.
 * All keys are server-only env vars — never hardcoded, never sent to the
 * browser, never committed. With no provider configured the route returns
 * { image: null } so the UI shows the branded gradient and the app still builds
 * and deploys.
 */

const GEMINI_MODELS = [
  process.env.NANO_BANANA_MODEL,
  "gemini-2.5-flash-image",
  "gemini-2.5-flash-image-preview",
].filter((m): m is string => Boolean(m));

// Small in-memory cache so the 3 concepts (and reloads) don't re-bill.
const cache = new Map<string, string>();
const CACHE_MAX = 60;

function cacheSet(key: string, value: string) {
  if (cache.size >= CACHE_MAX) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  cache.set(key, value);
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
    "Strictly no text, no words, no letters, no logos, no watermarks, no UI, no borders. One clean photographic image. Square 1:1 composition.",
  ]
    .filter(Boolean)
    .join(" ");
}

/* ------------------------------ HuggingFace ------------------------------- */

async function generateWithHuggingFace(prompt: string): Promise<string | null> {
  const token = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY;
  if (!token) return null;
  const model =
    process.env.HUGGINGFACE_IMAGE_MODEL || "black-forest-labs/FLUX.1-schnell";
  const url = `https://api-inference.huggingface.co/models/${model}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 55_000);
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  try {
    // Retry on transient failures: cold-start (503), rate-limit (429), and
    // network errors (flaky DNS / connection resets).
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const res = await fetch(url, {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "image/png",
          },
          body: JSON.stringify({ inputs: prompt }),
        });
        const ct = res.headers.get("content-type") || "";
        if (res.ok && ct.startsWith("image/")) {
          const buf = Buffer.from(await res.arrayBuffer());
          return `data:${ct};base64,${buf.toString("base64")}`;
        }
        if ((res.status === 503 || res.status === 429) && attempt < 3) {
          await wait(3500);
          continue;
        }
        return null;
      } catch {
        if (attempt < 3) {
          await wait(1500);
          continue;
        }
        return null;
      }
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------- Replicate -------------------------------- */

async function generateWithReplicate(prompt: string): Promise<string | null> {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) return null;
  const model = process.env.REPLICATE_IMAGE_MODEL || "black-forest-labs/flux-schnell";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 55_000);
  try {
    const res = await fetch(
      `https://api.replicate.com/v1/models/${model}/predictions`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({
          input: {
            prompt,
            aspect_ratio: "1:1",
            output_format: "webp",
            output_quality: 90,
            num_outputs: 1,
          },
        }),
      },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { output?: string | string[] };
    const out = Array.isArray(json.output) ? json.output[0] : json.output;
    if (!out || typeof out !== "string") return null;

    const imgRes = await fetch(out, { signal: controller.signal });
    if (!imgRes.ok) return null;
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const mime = imgRes.headers.get("content-type") || "image/webp";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------ Vertex / Gemini ---------------------------- */

type GenAIOptions = ConstructorParameters<typeof GoogleGenAI>[0];

function makeGeminiClient(): GoogleGenAI | null {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
  const useVertex = process.env.GOOGLE_GENAI_USE_VERTEXAI !== "false" && !!project;

  if (useVertex) {
    const options: GenAIOptions = { vertexai: true, project, location };
    const credsJson = process.env.GOOGLE_VERTEX_CREDENTIALS;
    if (credsJson) {
      try {
        const credentials = JSON.parse(credsJson) as Record<string, unknown>;
        (options as { googleAuthOptions?: { credentials?: unknown } }).googleAuthOptions =
          { credentials };
      } catch {
        /* fall through to default ADC discovery */
      }
    }
    return new GoogleGenAI(options);
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  return apiKey ? new GoogleGenAI({ apiKey }) : null;
}

async function generateWithGemini(prompt: string): Promise<string | null> {
  const ai = makeGeminiClient();
  if (!ai) return null;
  for (const model of GEMINI_MODELS) {
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
          return `data:${inline.mimeType || "image/png"};base64,${inline.data}`;
        }
      }
    } catch {
      /* try next model id */
    }
  }
  return null;
}

/* --------------------------------- route ---------------------------------- */

export async function POST(request: Request) {
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

  const hf = await generateWithHuggingFace(prompt);
  if (hf) {
    cacheSet(prompt, hf);
    return NextResponse.json({ image: hf, provider: "huggingface" });
  }

  const replicate = await generateWithReplicate(prompt);
  if (replicate) {
    cacheSet(prompt, replicate);
    return NextResponse.json({ image: replicate, provider: "replicate" });
  }

  const gemini = await generateWithGemini(prompt);
  if (gemini) {
    cacheSet(prompt, gemini);
    return NextResponse.json({ image: gemini, provider: "vertex" });
  }

  return NextResponse.json({ image: null, reason: "no-provider" });
}
