import ipaddr from "ipaddr.js";

import { ValidationError } from "@/lib/errors";
import { isHttpUrl, normalizeUrl } from "@/lib/security/url";

/**
 * Server-Side Request Forgery (SSRF) protection for user-supplied URLs.
 *
 * Before the application fetches a URL provided by a user (store domain,
 * webhook endpoint, image to import, …) we validate that it points at a
 * public, http(s) destination — never at loopback, the local network, or a
 * cloud metadata endpoint.
 *
 * This module is intentionally dependency-light and synchronous so it can be
 * unit-tested in plain Node. It does NOT perform DNS resolution.
 */

export interface UrlSafetyResult {
  safe: boolean;
  reason?: string;
  url?: URL;
}

/**
 * Hostnames that must never be reachable, regardless of how they resolve.
 * Matched case-insensitively against the URL hostname (and, for ".local",
 * as a suffix to catch mDNS names like "printer.local").
 */
const BLOCKED_HOSTNAMES = new Set<string>([
  "localhost",
  "metadata.google.internal",
  // The link-local cloud metadata address. It is also caught by the IP range
  // check below, but we list it explicitly for a clearer error message and in
  // case it ever arrives in a non-canonical IP form.
  "169.254.169.254",
]);

/**
 * IP ranges (per ipaddr.js `range()`) that are considered non-public and are
 * rejected for both IPv4 and IPv6 literals.
 */
const BLOCKED_IP_RANGES = new Set<string>([
  "private",
  "loopback",
  "linkLocal",
  "uniqueLocal",
  "reserved",
  "unspecified",
  "broadcast",
  "carrierGradeNat",
]);

function blocked(reason: string): never {
  throw new ValidationError(`That URL is not allowed: ${reason}`);
}

/**
 * Normalize and validate a user-supplied URL for outbound fetching.
 *
 * Rejects:
 *  - non-http(s) schemes (file:, ftp:, data:, gopher:, …)
 *  - the hostnames "localhost", any "*.local" name, "metadata.google.internal"
 *    and "169.254.169.254"
 *  - any host that is an IP literal in a private, loopback, link-local,
 *    unique-local, reserved, unspecified, broadcast or carrier-grade-NAT range
 *
 * Returns the parsed {@link URL} when the address is considered safe.
 *
 * NOTE: Hostnames that are DNS names (not IP literals) intentionally pass the
 * IP-range checks here — we do not resolve DNS in this synchronous helper.
 * DNS-rebinding mitigation (re-checking the resolved address, and pinning the
 * connection to it) belongs at fetch time and must be applied there.
 */
export function assertSafeUrl(input: string): URL {
  const url = new URL(normalizeUrl(input));

  if (!isHttpUrl(url)) {
    blocked(`the "${url.protocol.replace(/:$/, "")}" scheme is not supported.`);
  }

  // URL.hostname for IPv6 literals is wrapped in brackets, e.g. "[::1]".
  // Strip them before hostname comparisons and IP parsing.
  const hostname = url.hostname.toLowerCase();
  const bareHost =
    hostname.startsWith("[") && hostname.endsWith("]")
      ? hostname.slice(1, -1)
      : hostname;

  if (BLOCKED_HOSTNAMES.has(bareHost)) {
    blocked(`"${bareHost}" is a reserved hostname.`);
  }

  // Block mDNS / local-only names such as "mymac.local".
  if (bareHost === "local" || bareHost.endsWith(".local")) {
    blocked(`".local" hostnames are not reachable.`);
  }

  // If the host is an IP literal, reject any non-public range. Plain DNS
  // names are not valid IPs and fall through (see NOTE above).
  if (ipaddr.isValid(bareHost)) {
    let addr = ipaddr.parse(bareHost);

    // Treat IPv4-mapped IPv6 (e.g. "::ffff:127.0.0.1") as its IPv4 form so the
    // underlying IPv4 range is what gets evaluated.
    if (addr.kind() === "ipv6") {
      const v6 = addr as ipaddr.IPv6;
      if (v6.isIPv4MappedAddress()) {
        addr = v6.toIPv4Address();
      }
    }

    const range = addr.range();
    if (BLOCKED_IP_RANGES.has(range)) {
      blocked(`"${bareHost}" is in a non-public ("${range}") address range.`);
    }
  }

  return url;
}

/**
 * Non-throwing wrapper around {@link assertSafeUrl}.
 *
 * Returns `{ safe: true, url }` for allowed URLs, or `{ safe: false, reason }`
 * with a human-readable explanation otherwise.
 */
export function checkUrlSafety(input: string): UrlSafetyResult {
  try {
    const url = assertSafeUrl(input);
    return { safe: true, url };
  } catch (err) {
    const reason =
      err instanceof ValidationError
        ? err.userMessage
        : "The URL could not be validated.";
    return { safe: false, reason };
  }
}
