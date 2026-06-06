import "server-only";
import { lookup } from "node:dns/promises";
import ipaddr from "ipaddr.js";
import * as cheerio from "cheerio";
import { assertSafeUrl } from "@/lib/security/ssrf";
import { ExternalApiError, ValidationError } from "@/lib/errors";
import type { SiteInspection } from "./types";

const PRIVATE_RANGES = [
  "private",
  "loopback",
  "linkLocal",
  "uniqueLocal",
  "reserved",
  "unspecified",
  "broadcast",
  "carrierGradeNat",
];

/** DNS-rebinding guard: resolve the host and reject non-public addresses. */
async function assertPublicHost(hostname: string): Promise<void> {
  let address: string;
  try {
    ({ address } = await lookup(hostname));
  } catch {
    throw new ValidationError("We couldn't resolve that domain.");
  }
  try {
    const range = ipaddr.parse(address).range();
    if (PRIVATE_RANGES.includes(range)) {
      throw new ValidationError("That host resolves to a non-public address.");
    }
  } catch (err) {
    if (err instanceof ValidationError) throw err;
    throw new ValidationError("That host could not be verified as public.");
  }
}

function clean(text: string | undefined | null): string | null {
  if (!text) return null;
  const t = text.replace(/\s+/g, " ").trim();
  return t.length ? t.slice(0, 400) : null;
}

function absoluteUrl(base: URL, maybe: string | undefined): string | null {
  if (!maybe) return null;
  try {
    return new URL(maybe, base).toString();
  } catch {
    return null;
  }
}

/** Parse a homepage's HTML into a normalized brand-signal snapshot. */
function extractFromHtml(
  html: string,
  url: URL,
  input: string,
  finalUrl: string,
): SiteInspection {
  const $ = cheerio.load(html);

  const meta = (name: string) =>
    clean($(`meta[name="${name}"]`).attr("content")) ??
    clean($(`meta[property="${name}"]`).attr("content"));

  const og = (prop: string) => clean($(`meta[property="og:${prop}"]`).attr("content"));

  const headings = Array.from(
    new Set(
      $("h1, h2")
        .map((_, el) => clean($(el).text()))
        .get()
        .filter((t): t is string => Boolean(t) && t.length < 120),
    ),
  ).slice(0, 8);

  const ctas = Array.from(
    new Set(
      $("a, button")
        .map((_, el) => clean($(el).text()))
        .get()
        .filter((t): t is string => Boolean(t) && t.length >= 3 && t.length < 40),
    ),
  )
    .filter((t) =>
      /\b(shop|buy|order|add|get|start|join|subscribe|sale|new|explore|discover)\b/i.test(t),
    )
    .slice(0, 6);

  const keywords = (meta("keywords") ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 10);

  return {
    url: input,
    finalUrl,
    domain: url.hostname.replace(/^www\./, ""),
    title: clean($("title").first().text()) ?? og("title"),
    description: meta("description") ?? og("description"),
    siteName: og("site_name"),
    ogImage: absoluteUrl(url, og("image") ?? undefined),
    themeColor: clean($('meta[name="theme-color"]').attr("content")),
    headings,
    ctas,
    keywords,
  };
}

/**
 * Scrape via Firecrawl when FIRECRAWL_API_KEY is set. Firecrawl renders
 * JavaScript and handles anti-bot pages, so it reads modern storefronts
 * (Shopify, headless) that a plain fetch can't. Returns rendered HTML which we
 * feed through the same extractor. Returns null if unconfigured or it fails, so
 * the caller falls back to the direct fetch.
 */
async function fetchViaFirecrawl(
  url: URL,
): Promise<{ html: string; finalUrl: string } | null> {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        url: url.toString(),
        formats: ["rawHtml"],
        onlyMainContent: false,
        timeout: 20_000,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: {
        rawHtml?: string;
        html?: string;
        metadata?: { sourceURL?: string; url?: string };
      };
    };
    const html = json.data?.rawHtml ?? json.data?.html;
    if (!html || typeof html !== "string") return null;
    const finalUrl =
      json.data?.metadata?.sourceURL || json.data?.metadata?.url || url.toString();
    return { html, finalUrl };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Compliant inspection of a public website. SSRF-protected (URL validation +
 * DNS resolution check). Prefers the Firecrawl scraping service when configured
 * (renders JS), otherwise a time/size-limited direct fetch. Returns a
 * normalized snapshot of the homepage's brand signals.
 */
export async function inspectSite(input: string): Promise<SiteInspection> {
  const url = assertSafeUrl(input);
  await assertPublicHost(url.hostname);

  // Preferred: real scraping service (renders JS, handles anti-bot).
  const scraped = await fetchViaFirecrawl(url);
  if (scraped) {
    return extractFromHtml(scraped.html, url, input, scraped.finalUrl);
  }

  // Fallback: SSRF-safe, time/size-limited direct fetch.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "AvokadoBot/1.0 (+https://tryavokado.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
  } catch {
    throw new ExternalApiError(
      "We couldn't reach that site. Check the URL and try again.",
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    throw new ExternalApiError(`That site responded with ${res.status}.`);
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("html")) {
    throw new ValidationError("That URL doesn't return a web page.");
  }
  const length = Number(res.headers.get("content-length") ?? "0");
  if (length && length > 6_000_000) {
    throw new ValidationError("That page is too large to inspect.");
  }

  const html = (await res.text()).slice(0, 800_000);
  return extractFromHtml(html, url, input, res.url || url.toString());
}
