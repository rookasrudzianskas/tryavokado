import { NextResponse } from "next/server";
import { inspectSite } from "@/lib/brand/inspect";
import { buildBrandPreview } from "@/lib/brand/generate";
import { rateLimit } from "@/lib/security/rate-limit";
import { toErrorResponse } from "@/lib/errors";

export const runtime = "nodejs";

/**
 * No-login brand-preview generator. Inspects a public website (SSRF-protected,
 * time/size-limited, rate-limited) and returns a preview brand book.
 */
export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "anon";
  const rl = rateLimit(`brand-generate:${ip}`, { limit: 12, windowMs: 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.url || typeof body.url !== "string") {
    return NextResponse.json({ error: "Enter a website URL." }, { status: 400 });
  }

  try {
    const inspection = await inspectSite(body.url);
    const preview = buildBrandPreview(inspection);
    return NextResponse.json({ preview });
  } catch (err) {
    const e = toErrorResponse(err);
    return NextResponse.json({ error: e.message }, { status: e.httpStatus });
  }
}
