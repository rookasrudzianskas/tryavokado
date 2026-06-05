import { ValidationError } from "@/lib/errors";

/**
 * URL helpers shared by SSRF protection and any place that accepts a
 * user-supplied web address (store URLs, webhook targets, etc.).
 *
 * These are intentionally dependency-light and synchronous so they can be
 * unit-tested in plain Node without pulling in server-only modules.
 */

/**
 * Trim the input, default a missing scheme to https://, and validate that the
 * result parses as a URL. Returns the canonical href.
 *
 * Throws {@link ValidationError} when the input is empty or cannot be parsed.
 */
export function normalizeUrl(input: string): string {
  if (typeof input !== "string") {
    throw new ValidationError("A URL is required.");
  }

  const trimmed = input.trim();
  if (trimmed.length === 0) {
    throw new ValidationError("A URL is required.");
  }

  // Add a scheme when the user typed a bare host like "example.com".
  // We detect an existing scheme with the RFC 3986 shape: scheme://...
  // (e.g. "https:", "ftp:", "mailto:"). A bare "//host" is treated as
  // scheme-relative and also gets https.
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed);
  const candidate = hasScheme ? trimmed : `https://${trimmed.replace(/^\/+/, "")}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    throw new ValidationError(`"${trimmed}" is not a valid URL.`);
  }

  return url.href;
}

/**
 * True only for the http: and https: schemes. Everything else
 * (file:, ftp:, data:, javascript:, gopher:, etc.) is rejected.
 */
export function isHttpUrl(u: URL): boolean {
  return u.protocol === "http:" || u.protocol === "https:";
}

/**
 * Return the lowercased hostname with a single leading "www." removed.
 *
 * This is a pragmatic "registrable domain" used for display and de-duplication
 * (e.g. grouping "www.shop.example.com" with "shop.example.com"). It does NOT
 * consult the public suffix list, so it will not collapse multi-level public
 * suffixes like "co.uk"; that is acceptable for our current use.
 */
export function getRegistrableDomain(host: string): string {
  const normalized = host.trim().toLowerCase();
  return normalized.startsWith("www.") ? normalized.slice(4) : normalized;
}
