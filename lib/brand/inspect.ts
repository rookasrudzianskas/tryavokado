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
    // Unparseable address — be conservative.
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

/**
 * Compliant single-page inspection of a public website. SSRF-protected (URL
 * validation + DNS resolution check), time-limited, size-limited. Returns a
 * normalized snapshot of the homepage's brand signals.
 */
export async function inspectSite(input: string): Promise<SiteInspection> {
  const url = assertSafeUrl(input);
  await assertPublicHost(url.hostname);

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
    throw new ExternalApiError("We couldn't reach that site. Check the URL and try again.");
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
    .filter((t) => /\b(shop|buy|order|add|get|start|join|subscribe|sale|new|explore|discover)\b/i.test(t))
    .slice(0, 6);

  const keywords = (meta("keywords") ?? "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 10);

  return {
    url: input,
    finalUrl: res.url || url.toString(),
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
